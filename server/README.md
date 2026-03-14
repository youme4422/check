# Check Messenger Server

This Node.js API server receives message requests from the Expo app and forwards them to LINE Messaging API, Telegram Bot API, SMTP email, and WhatsApp Cloud API.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your real LINE / Telegram / SMTP / WhatsApp settings
3. Set message cooldown if needed (`MESSAGE_COOLDOWN_MINUTES`)
4. Install dependencies
5. Start the server

```powershell
Set-Location "C:\Users\jan26\check\server"
npm install
npm run dev
```

## API

- `POST /api/users/:userId/messenger-links`
- `POST /api/messages/send`

### Link recipients

`POST /api/users/:userId/messenger-links`

```json
{
  "telegramChatId": "12345678",
  "email": "alert@example.com",
  "whatsappTo": "+821012345678"
}
```

### Send message

`POST /api/messages/send`

```json
{
  "userId": "demo-user",
  "channel": "telegram_email",
  "text": "Deadman switch alert: check-in missed."
}
```

You can also use channel `line_whatsapp` to deliver to both LINE and WhatsApp in one request.

### Send cooldown (rate limit)

- `MESSAGE_COOLDOWN_MINUTES` controls how often one user can send.
- Example: `60` means each `userId` can send at most once per 60 minutes.
- If blocked, API returns:

```json
{
  "status": "rate_limited",
  "deliveredChannels": [],
  "retryAfterSeconds": 1234
}
```

## Notes

- This starter stores linked messenger IDs in memory. Replace the store with a database before production use.
- LINE requires a valid recipient user ID that can receive push messages from your official account.
- Telegram requires the user to start the bot first so the bot can send messages to that chat.
- Email sending uses SMTP credentials from `.env`.
- WhatsApp sending uses Meta WhatsApp Cloud API (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`).
