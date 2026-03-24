# LINE + Telegram + Email Deadman Backend (Node.js)

This backend currently supports:
- LINE bot delivery
- Telegram bot delivery
- Email delivery (Resend or SMTP)
- per-user client key auth for app endpoints
- admin API key auth for status endpoint
- rate limiting
- per-user cooldown

## Environment

Create `server/.env`:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
# Or use separate fields (easier to debug):
# PGHOST=aws-1-ap-southeast-1.pooler.supabase.com
# PGPORT=5432
# PGDATABASE=postgres
# PGUSER=postgres.your_project_ref
# PGPASSWORD=your_database_password
# PGSSLMODE_REJECT_UNAUTHORIZED=false
SERVER_API_KEY=replace_with_strong_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_SECRET=your_telegram_webhook_secret
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
MESSAGE_COOLDOWN_MINUTES=60
LINK_CODE_TTL_MINUTES=30
SAFETY_MARGIN_MESSAGES=10
FREE_LIMIT_TELEGRAM_PER_MONTH=0
FREE_LIMIT_LINE_PER_MONTH=200
FREE_LIMIT_EMAIL_PER_MONTH=3000
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_PER_IP=120
RATE_LIMIT_PER_USER=60

# Optional email (Resend recommended)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=

# Optional email (SMTP fallback)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Monthly quota rule:
- Effective auto-send quota is `FREE_LIMIT_*_PER_MONTH - SAFETY_MARGIN_MESSAGES`
- Example: LINE `200 - 10 = 190`, Email `3000 - 10 = 2990`
- `FREE_LIMIT_TELEGRAM_PER_MONTH=0` means unlimited (no quota cap)

## Run

```powershell
Set-Location "C:\Users\jan26\check\server"
npm install
npm run dev
```

## Deploy (Render quick path)

This repo includes:
- `render.yaml` (root)
- `server/Dockerfile`

Steps:
1. Connect repo in Render using Blueprint deploy.
2. Fill secret env vars in Render (`SERVER_API_KEY`, `PGHOST`, `PGUSER`, `PGPASSWORD`, channel tokens).
3. After deploy, verify:
   - `GET https://<your-domain>/health`
   - `GET https://<your-domain>/api/config/status` with `x-api-key`.
4. Use that HTTPS domain in Expo build env:
   - `EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL=https://<your-domain>`

If `DATABASE_URL` is set, the server will use PostgreSQL and auto-create required tables.
If `DATABASE_URL` is empty but `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD` are set, PostgreSQL is also enabled.
If `DATABASE_URL` is empty, it falls back to in-memory mode (not recommended for production).

## API Auth

- User endpoints (`/api/users/*`, `/api/messages/send`) require:
  - `x-client-key: <device_client_key>`
- Admin endpoint (`/api/config/status`) requires:
  - `x-api-key: <SERVER_API_KEY>`
  or `Authorization: Bearer <SERVER_API_KEY>`

## Link LINE / Telegram (easy mode)

1. App calls:
`POST /api/users/:userId/link-codes`

```json
{ "channel": "telegram" }
```
or
```json
{ "channel": "line" }
```

2. User sends code to bot chat (both formats supported):
`<code>` or `LINK <code>`

3. Webhook endpoints:
`POST /telegram/webhook`
`POST /line/webhook`

For Telegram webhook security, set a secret token when registering webhook and use the same value in `TELEGRAM_WEBHOOK_SECRET`.

### Production checklist for LINE/Telegram

- Set `LINE_CHANNEL_ACCESS_TOKEN` and `TELEGRAM_BOT_TOKEN` in `server/.env`
- Set webhook URLs to your public `https` server:
  - `POST https://<your-domain>/line/webhook`
  - `POST https://<your-domain>/telegram/webhook`
- Keep `SERVER_API_KEY` strong and private
- Verify config status (authenticated route):
  - `GET /api/config/status`
  - Expect `channels.line.configured=true` and `channels.telegram.configured=true`

## Register email

`POST /api/users/:userId/messenger-links`

```json
{ "email": "alert@example.com" }
```

Email send priority:
1. Resend (`RESEND_API_KEY` + `RESEND_FROM_EMAIL`)
2. SMTP fallback (`SMTP_*`)

## Send alert

`POST /api/messages/send`

```json
{
  "userId": "demo-user",
  "channels": ["line", "telegram", "email"],
  "text": "Deadman switch alert: check-in missed."
}
```

## Cooldown response

```json
{
  "ok": true,
  "status": "rate_limited",
  "deliveredChannels": [],
  "retryAfter": 1234
}
```

## Quota limited response

```json
{
  "ok": true,
  "status": "quota_limited",
  "deliveredChannels": [],
  "blockedChannels": [
    {
      "channel": "line",
      "reason": "monthly_quota_exceeded",
      "limit": 190,
      "used": 190,
      "remaining": 0,
      "resetAt": 1764547200000
    }
  ],
  "retryAfter": 123456
}
```
