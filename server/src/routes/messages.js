import { Router } from 'express';

import { env } from '../config/env.js';
import { dispatchMessage } from '../services/message.service.js';
import { createLinkCode, getMessengerLinks, saveMessengerLinks, verifyOrInitClientKey } from '../store/userStore.js';
import { sendError, sendOk } from '../utils/http.js';

export const messagesRouter = Router();

function readAdminApiKey(req) {
  const keyFromHeader = String(req.header('x-api-key') || '').trim();
  const authHeader = String(req.header('authorization') || '').trim();
  const keyFromBearer = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  return keyFromHeader || keyFromBearer;
}

function getClientKey(req) {
  return String(req.header('x-client-key') || '').trim();
}

function isValidUserId(value) {
  return /^[a-zA-Z0-9._-]{3,64}$/.test(value);
}

function isValidTelegramChatId(value) {
  return /^-?\d{5,20}$/.test(value);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidLineUserId(value) {
  return /^U[0-9a-fA-F]{32}$/.test(value);
}

async function authorizeUserRequest(req, res, userId) {
  const auth = await verifyOrInitClientKey(userId, getClientKey(req));
  if (auth.ok) {
    return true;
  }

  if (auth.reason === 'invalid_client_key') {
    sendError(res, 401, 'INVALID_CLIENT_KEY', 'x-client-key is required and must be 16-128 chars.');
    return false;
  }

  sendError(res, 401, 'CLIENT_KEY_MISMATCH', 'Client key mismatch for this account.');
  return false;
}

messagesRouter.get('/config/status', (req, res) => {
  const apiKey = readAdminApiKey(req);
  if (!apiKey || apiKey !== env.serverApiKey) {
    sendError(res, 401, 'AUTH_REQUIRED', 'API key is required.');
    return;
  }

  sendOk(res, {
    dbConfigured: Boolean(env.databaseUrl || (env.pgHost && env.pgDatabase && env.pgUser && env.pgPassword)),
    channels: {
      line: {
        configured: Boolean(env.lineChannelAccessToken),
        webhookSignatureEnabled: Boolean(env.lineChannelSecret),
      },
      telegram: {
        configured: Boolean(env.telegramBotToken),
        webhookSecretEnabled: Boolean(env.telegramWebhookSecret),
      },
    },
  });
});

messagesRouter.get('/users/:userId/messenger-links', async (req, res) => {
  const userId = String(req.params.userId || '').trim();
  if (!isValidUserId(userId)) {
    sendError(res, 400, 'INVALID_USER_ID', 'userId must be 3-64 chars: letters, numbers, dot, underscore, or hyphen.');
    return;
  }

  if (!(await authorizeUserRequest(req, res, userId))) {
    return;
  }

  try {
    const links = await getMessengerLinks(userId);
    sendOk(res, {
      userId,
      lineUserId: String(links?.lineUserId || '').trim(),
      telegramChatId: String(links?.telegramChatId || '').trim(),
      email: String(links?.email || '').trim().toLowerCase(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load messenger links.';
    console.error(`[messenger-links-load-failed] userId=${userId} reason=${message}`);
    sendError(res, 500, 'MESSENGER_LINKS_LOAD_FAILED', 'Unable to load messenger links.');
  }
});

messagesRouter.post('/users/:userId/messenger-links', async (req, res) => {
  try {
    const userId = String(req.params.userId || '').trim();
    const channel = String(req.body?.channel || '').trim().toLowerCase();
    const chatId = String(req.body?.chatId || '').trim();
    const lineUserId = String(req.body?.lineUserId || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const telegramChatId = String(req.body?.telegramChatId || '').trim();

    if (!isValidUserId(userId)) {
      sendError(res, 400, 'INVALID_USER_ID', 'userId must be 3-64 chars: letters, numbers, dot, underscore, or hyphen.');
      return;
    }

    if (!(await authorizeUserRequest(req, res, userId))) {
      return;
    }

    if (channel || chatId) {
      if (!['line', 'telegram', 'email'].includes(channel)) {
        sendError(res, 400, 'UNSUPPORTED_CHANNEL', 'Only line, telegram, or email channel is enabled in this mode.');
        return;
      }

      if (channel === 'line') {
        if (!isValidLineUserId(lineUserId)) {
          sendError(res, 400, 'INVALID_LINE_USER_ID', 'lineUserId format is invalid.');
          return;
        }

        const saved = await saveMessengerLinks(userId, { lineUserId });
        sendOk(res, { status: 'saved', user: saved });
        return;
      }

      if (channel === 'telegram') {
        if (!isValidTelegramChatId(chatId)) {
          sendError(res, 400, 'INVALID_CHAT_ID', 'chatId format is invalid.');
          return;
        }

        const saved = await saveMessengerLinks(userId, { telegramChatId: chatId });
        sendOk(res, { status: 'saved', user: saved });
        return;
      }

      if (!isValidEmail(email)) {
        sendError(res, 400, 'INVALID_EMAIL', 'email format is invalid.');
        return;
      }

      const saved = await saveMessengerLinks(userId, { email });
      sendOk(res, { status: 'saved', user: saved });
      return;
    }

    const hasLine = Boolean(lineUserId);
    const hasTelegram = Boolean(telegramChatId);
    const hasEmail = Boolean(email);

    if (!hasLine && !hasTelegram && !hasEmail) {
      sendError(res, 400, 'NO_RECIPIENT', 'lineUserId, telegramChatId or email is required.');
      return;
    }

    if (hasLine && !isValidLineUserId(lineUserId)) {
      sendError(res, 400, 'INVALID_LINE_USER_ID', 'lineUserId format is invalid.');
      return;
    }

    if (hasTelegram && !isValidTelegramChatId(telegramChatId)) {
      sendError(res, 400, 'INVALID_TELEGRAM_CHAT_ID', 'telegramChatId format is invalid.');
      return;
    }

    if (hasEmail && !isValidEmail(email)) {
      sendError(res, 400, 'INVALID_EMAIL', 'email format is invalid.');
      return;
    }

    const saved = await saveMessengerLinks(userId, {
      lineUserId: hasLine ? lineUserId : undefined,
      telegramChatId: hasTelegram ? telegramChatId : undefined,
      email: hasEmail ? email : undefined,
    });
    sendOk(res, { status: 'saved', user: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save messenger links.';
    console.error(`[messenger-links-failed] reason=${message}`);
    sendError(res, 500, 'MESSENGER_LINKS_FAILED', 'Unable to save messenger links.');
  }
});

messagesRouter.post('/users/:userId/link-codes', async (req, res) => {
  const userId = String(req.params.userId || '').trim();
  const channel = String(req.body?.channel || '').trim().toLowerCase();

  if (!isValidUserId(userId)) {
    sendError(res, 400, 'INVALID_USER_ID', 'userId must be 3-64 chars: letters, numbers, dot, underscore, or hyphen.');
    return;
  }

  if (!(await authorizeUserRequest(req, res, userId))) {
    return;
  }

  if (!['line', 'telegram'].includes(channel)) {
    sendError(res, 400, 'UNSUPPORTED_CHANNEL', 'Only line or telegram is supported for link codes.');
    return;
  }

  if (channel === 'line' && !env.lineChannelAccessToken) {
    sendError(res, 400, 'CHANNEL_NOT_CONFIGURED', 'LINE is not configured on server.');
    return;
  }

  if (channel === 'telegram' && !env.telegramBotToken) {
    sendError(res, 400, 'CHANNEL_NOT_CONFIGURED', 'Telegram is not configured on server.');
    return;
  }

  try {
    const data = createLinkCode(userId, channel);
    sendOk(res, {
      status: 'created',
      channel,
      code: data.code,
      expiresAt: data.expiresAt,
      expiresInSeconds: data.expiresInSeconds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create link code.';
    console.error(`[link-code-failed] userId=${userId} reason=${message}`);
    sendError(res, 400, 'LINK_CODE_FAILED', 'Unable to create link code.');
  }
});

messagesRouter.post('/messages/send', async (req, res) => {
  const userId = String(req.body?.userId || '').trim();
  const channel = String(req.body?.channel || '').trim().toLowerCase();
  const channels = Array.isArray(req.body?.channels)
    ? req.body.channels.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean)
    : [];
  const text = String(req.body?.text || '').trim();

  if (!isValidUserId(userId)) {
    sendError(res, 400, 'INVALID_USER_ID', 'userId must be 3-64 chars: letters, numbers, dot, underscore, or hyphen.');
    return;
  }

  if (!(await authorizeUserRequest(req, res, userId))) {
    return;
  }

  if (!text) {
    sendError(res, 400, 'TEXT_REQUIRED', 'text is required.');
    return;
  }

  if (text.length > 1000) {
    sendError(res, 400, 'TEXT_TOO_LONG', 'text must be 1000 characters or fewer.');
    return;
  }

  if (!channel && channels.length === 0) {
    sendError(res, 400, 'CHANNEL_REQUIRED', 'channel or channels is required.');
    return;
  }

  const invalidSingle = channel && !['line', 'telegram', 'email'].includes(channel);
  const invalidMulti = channels.some((item) => !['line', 'telegram', 'email'].includes(item));
  if (invalidSingle || invalidMulti) {
    sendError(res, 400, 'UNSUPPORTED_CHANNEL', 'Only line, telegram, or email channel is enabled in this mode.');
    return;
  }

  try {
    const result = await dispatchMessage({
      userId,
      channel,
      channels,
      text,
    });

    sendOk(res, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Message dispatch failed.';
    console.error(`[dispatch-failed] userId=${userId} reason=${message}`);
    sendError(res, 400, 'DISPATCH_FAILED', 'Message dispatch failed.', {
      detail: String(message).slice(0, 300),
    });
  }
});
