# TaeB Production Deploy Checklist

## 1) Server (필수)

`server/.env` 확인:

```env
PORT=4000
SERVER_API_KEY=YOUR_STRONG_KEY

PGHOST=aws-1-ap-southeast-1.pooler.supabase.com
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres.pazjqrixnuiddenfosll
PGPASSWORD=YOUR_DB_PASSWORD
PGSSLMODE_REJECT_UNAUTHORIZED=false
```

실행 확인:

```powershell
cd c:\Users\jan26\check\server
npm install
npm run start
```

헬스체크:

`http://localhost:4000/health` -> `{"status":"ok"}`

## 2) Expo build env (필수)

EAS 환경변수(Production) 등록:

- `EXPO_PUBLIC_MESSENGER_SERVER_BASE_URL` = `https://<your-server-domain>`
- `EXPO_PUBLIC_MESSENGER_SERVER_API_KEY` = `SERVER_API_KEY와 동일값`

## 3) Android AAB build

```powershell
cd c:\Users\jan26\check
npm install
npm run build:android
```

완료 후 EAS에서 `.aab` 다운로드 -> Google Play Console 업로드.

## 4) Play Console 업로드 전 체크

- 버전코드 중복 금지(기존보다 커야 함)
- 앱 설명/스크린샷 최신 반영
- 개인정보처리방침 URL 동작 확인
- 서버 URL이 `https` 인지 확인

## 5) 실패 시 빠른 점검

- `password authentication failed` -> DB 비밀번호 재설정 후 `.env` 갱신
- `Tenant or user not found` -> `PGUSER` 오타 확인 (`postgres.<project-ref>`)
- EAS build limit 초과 -> 월 리셋 대기 또는 유료 플랜

