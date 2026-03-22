import express from 'express';
import crypto from 'node:crypto';

import { env } from './config/env.js';
import { initDatabase, isDatabaseEnabled } from './db/client.js';
import { requireApiAuth } from './middleware/auth.js';
import { rateLimitRequest } from './middleware/rateLimit.js';
import { messagesRouter } from './routes/messages.js';
import { replyLineMessage } from './services/line.service.js';
import { replyTelegramMessage } from './services/telegram.service.js';
import { consumeLinkCode } from './store/userStore.js';
import { sendError } from './utils/http.js';

const app = express();

function timingSafeEqualString(left, right) {
  const a = Buffer.from(String(left || ''), 'utf8');
  const b = Buffer.from(String(right || ''), 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function verifyLineSignature(rawBody, signature) {
  if (!env.lineChannelSecret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expected = crypto.createHmac('sha256', env.lineChannelSecret).update(rawBody).digest('base64');
  return timingSafeEqualString(signature, expected);
}

function verifyTelegramWebhookSecret(secretFromHeader) {
  if (!env.telegramWebhookSecret) {
    return true;
  }
  return timingSafeEqualString(secretFromHeader, env.telegramWebhookSecret);
}

function extractLinkCodeFromText(rawText) {
  const text = String(rawText || '').trim().toUpperCase();
  if (!text) {
    return '';
  }

  const direct = text.match(/\b[A-Z2-9]{8}\b/);
  if (direct) {
    return direct[0];
  }

  const command = text.match(/^LINK\s+([A-Z2-9]{8})$/);
  if (command) {
    return command[1];
  }

  return '';
}

function getLineLinkReplyText(result) {
  if (result?.ok) {
    return '연결이 완료되었습니다. 앱으로 돌아가서 LINE 연결 확인 버튼을 눌러주세요.';
  }
  if (result?.reason === 'expired') {
    return '코드가 만료되었습니다. 앱에서 새 코드를 생성해 다시 보내주세요.';
  }
  if (result?.reason === 'not_found') {
    return '유효하지 않은 코드입니다. 앱에서 최신 코드를 다시 복사해 보내주세요.';
  }
  if (result?.reason === 'channel_mismatch') {
    return '채널이 일치하지 않는 코드입니다. LINE 전용 코드를 보내주세요.';
  }
  return '코드를 확인하지 못했습니다. 앱에서 새 코드를 생성해 다시 시도해주세요.';
}

function getTelegramLinkReplyText(result) {
  if (result?.ok) {
    return '연결이 완료되었습니다. 앱으로 돌아가서 Telegram 연결 확인 버튼을 눌러주세요.';
  }
  if (result?.reason === 'expired') {
    return '코드가 만료되었습니다. 앱에서 새 코드를 생성해 다시 보내주세요.';
  }
  if (result?.reason === 'not_found') {
    return '유효하지 않은 코드입니다. 앱에서 최신 코드를 다시 복사해 보내주세요.';
  }
  if (result?.reason === 'channel_mismatch') {
    return '채널이 일치하지 않는 코드입니다. Telegram 전용 코드를 보내주세요.';
  }
  return '코드를 확인하지 못했습니다. 앱에서 새 코드를 생성해 다시 시도해주세요.';
}

app.post('/telegram/webhook', express.json(), async (req, res) => {
  try {
    const webhookSecret = String(req.headers['x-telegram-bot-api-secret-token'] || '');
    if (!verifyTelegramWebhookSecret(webhookSecret)) {
      sendError(res, 401, 'INVALID_TELEGRAM_SECRET', 'Telegram webhook secret check failed.');
      return;
    }

    const chatId = String(req.body?.message?.chat?.id || '').trim();
    const text = String(req.body?.message?.text || '').trim();
    const code = extractLinkCodeFromText(text);

    if (!chatId) {
      res.json({ ok: true });
      return;
    }

    if (!code) {
      await replyTelegramMessage({
        chatId,
        text: '앱에서 생성한 8자리 코드를 보내주세요.',
      });
      res.json({ ok: true });
      return;
    }

    const result = await consumeLinkCode('telegram', code, chatId);
    if (result.ok) {
      console.log(`[telegram-webhook] linked user=${result.userId}`);
    }

    await replyTelegramMessage({
      chatId,
      text: getTelegramLinkReplyText(result),
    });

    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Telegram webhook failed.';
    console.error(`[telegram-webhook-error] ${message}`);
    sendError(res, 500, 'TELEGRAM_WEBHOOK_FAILED', 'Telegram webhook processing failed.');
  }
});

app.post('/line/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from('');
    const signature = String(req.headers['x-line-signature'] || '');

    if (!verifyLineSignature(rawBody, signature)) {
      sendError(res, 401, 'INVALID_LINE_SIGNATURE', 'LINE webhook signature check failed.');
      return;
    }

    let payload = null;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      sendError(res, 400, 'INVALID_JSON', 'Webhook payload must be valid JSON.');
      return;
    }

    const events = Array.isArray(payload?.events) ? payload.events : [];
    for (const event of events) {
      const replyToken = String(event?.replyToken || '').trim();
      const eventType = String(event?.type || '').trim();
      const messageType = String(event?.message?.type || '').trim();
      const userId = String(event?.source?.userId || '').trim();
      const text = String(event?.message?.text || '').trim();
      const code = extractLinkCodeFromText(text);

      if (eventType !== 'message' || messageType !== 'text' || !replyToken) {
        continue;
      }

      if (!code) {
        await replyLineMessage({
          replyToken,
          text: '앱에서 생성한 8자리 코드를 보내주세요.',
        });
        continue;
      }

      if (!userId) {
        await replyLineMessage({
          replyToken,
          text: '사용자 정보를 확인할 수 없습니다. 다시 시도해주세요.',
        });
        continue;
      }

      const result = await consumeLinkCode('line', code, userId);
      if (result.ok) {
        console.log(`[line-webhook] linked user=${result.userId}`);
      }

      await replyLineMessage({
        replyToken,
        text: getLineLinkReplyText(result),
      });
    }

    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'LINE webhook failed.';
    console.error(`[line-webhook-error] ${message}`);
    sendError(res, 500, 'LINE_WEBHOOK_FAILED', 'LINE webhook processing failed.');
  }
});

app.use(express.json());

if (!env.serverApiKey) {
  throw new Error('SERVER_API_KEY is required.');
}

const hasTelegram = Boolean(env.telegramBotToken);
const hasLine = Boolean(env.lineChannelAccessToken);
const hasResendEmail = Boolean(env.resendApiKey && env.resendFromEmail);
const hasSmtpEmail = Boolean(env.smtpHost && env.smtpUser && env.smtpPass && env.smtpFrom);
const hasEmail = hasResendEmail || hasSmtpEmail;

if (!hasLine && !hasTelegram && !hasEmail) {
  throw new Error(
    'At least one channel must be configured (LINE_CHANNEL_ACCESS_TOKEN or TELEGRAM_BOT_TOKEN or RESEND/SMTP email settings).'
  );
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', requireApiAuth, rateLimitRequest);
app.use('/api', messagesRouter);

app.use((err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : 'Unknown error';
  console.error(`[server-error] ${message}`);
  sendError(res, 500, 'INTERNAL_ERROR', 'Internal server error.');
});

async function startServer() {
  if (isDatabaseEnabled()) {
    try {
      await initDatabase();
      console.log('[db] PostgreSQL connected and schema ready.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[db] init failed: ${message}`);
      process.exit(1);
    }
  } else {
    console.warn('[db] DATABASE_URL is not set. Running in memory mode.');
  }

  app.listen(env.port, () => {
    console.log(`Check messenger server listening on http://localhost:${env.port}`);
  });
}

void startServer();
