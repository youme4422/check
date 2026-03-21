import 'dotenv/config';

function parseNumber(raw, fallback) {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: parseNumber(process.env.PORT, 4000),
  databaseUrl: String(process.env.DATABASE_URL || '').trim(),
  pgHost: String(process.env.PGHOST || '').trim(),
  pgPort: parseNumber(process.env.PGPORT, 5432),
  pgDatabase: String(process.env.PGDATABASE || '').trim(),
  pgUser: String(process.env.PGUSER || '').trim(),
  pgPassword: String(process.env.PGPASSWORD || '').trim(),
  pgSslRejectUnauthorized:
    String(process.env.PGSSLMODE_REJECT_UNAUTHORIZED || 'false').toLowerCase() === 'true',
  serverApiKey: String(process.env.SERVER_API_KEY || '').trim(),
  lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  lineChannelSecret: process.env.LINE_CHANNEL_SECRET || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
  resendApiKey: process.env.RESEND_API_KEY || '',
  resendFromEmail: process.env.RESEND_FROM_EMAIL || '',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseNumber(process.env.SMTP_PORT, 587),
  smtpSecure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '',
  messageCooldownMinutes: Math.max(0, parseNumber(process.env.MESSAGE_COOLDOWN_MINUTES, 60)),
  safetyMarginMessages: Math.max(0, parseNumber(process.env.SAFETY_MARGIN_MESSAGES, 10)),
  freeLimitTelegramPerMonth: Math.max(0, parseNumber(process.env.FREE_LIMIT_TELEGRAM_PER_MONTH, 0)),
  freeLimitLinePerMonth: Math.max(0, parseNumber(process.env.FREE_LIMIT_LINE_PER_MONTH, 200)),
  freeLimitEmailPerMonth: Math.max(0, parseNumber(process.env.FREE_LIMIT_EMAIL_PER_MONTH, 3000)),
  rateLimitPerIp: Math.max(1, parseNumber(process.env.RATE_LIMIT_PER_IP, 120)),
  rateLimitPerUser: Math.max(1, parseNumber(process.env.RATE_LIMIT_PER_USER, 60)),
  rateLimitWindowSeconds: Math.max(1, parseNumber(process.env.RATE_LIMIT_WINDOW_SECONDS, 60)),
};
