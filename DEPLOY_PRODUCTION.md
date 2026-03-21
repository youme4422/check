# TaeB 배포(도메인) 빠른 가이드

## 1) 서버를 먼저 배포해서 HTTPS 도메인 확보

이 프로젝트는 `render.yaml` + `server/Dockerfile`이 준비되어 있습니다.

1. Render에서 `New +` -> `Blueprint` 선택
2. 이 GitHub 저장소 연결
3. 배포 후 도메인 확인  
   예: `https://taeb-messenger-server.onrender.com`

## 2) Render 환경변수 입력

`SERVER_API_KEY`, `PGHOST`, `PGUSER`, `PGPASSWORD`는 반드시 직접 넣으세요.

필수:
- `SERVER_API_KEY`
- `PGHOST`
- `PGUSER`
- `PGPASSWORD`

메신저:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

이메일(선택):
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## 3) 서버 정상 여부 확인

- `GET https://<your-domain>/health` -> `{"status":"ok"}`
- `GET https://<your-domain>/api/config/status`
  - Header: `x-api-key: <SERVER_API_KEY>`
  - `dbConfigured: true` 확인

## 4) 앱 빌드 변수 설정

EAS 환경변수(Production):
- `EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL=https://<your-domain>`
- `EXPO_PUBLIC_MESSENGER_SERVER_API_KEY=<SERVER_API_KEY>`

## 5) 텔레그램/라인 웹훅 주소 갱신

- Telegram: `https://<your-domain>/telegram/webhook`
- LINE: `https://<your-domain>/line/webhook`

## 6) AAB 빌드

```powershell
cd c:\Users\jan26\check
npm run build:android
```

중요:
- 스토어용은 반드시 `https://` 도메인 사용
- `localhost`/내부IP는 스토어 앱에서 동작하지 않음
