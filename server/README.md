# Check Messenger Server

This Node.js API server receives message requests from the Expo app and forwards them to LINE Messaging API and Telegram Bot API.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your real LINE and Telegram tokens
3. Install dependencies
4. Start the server

```powershell
Set-Location "C:\Users\jan26\check\server"
npm install
npm run dev
```

## API

- `POST /api/users/:userId/messenger-links`
- `POST /api/messages/send`

## Notes

- This starter stores linked messenger IDs in memory. Replace the store with a database before production use.
- LINE requires a valid recipient user ID that can receive push messages from your official account.
- Telegram requires the user to start the bot first so the bot can send messages to that chat.
