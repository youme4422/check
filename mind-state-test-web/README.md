# 마음 상태 분포 테스트

의학적 진단이 아닌, 현재 마음 상태를 돌아보기 위한 자가 체크 웹앱입니다.

## 기술 스택

- React + TypeScript
- Tailwind CSS
- Recharts
- Vite

## 로컬 실행

```bash
npm install
npm run dev
```

기본 URL: `http://localhost:5173`  
포트가 이미 사용 중이면 Vite가 자동으로 다른 포트를 사용합니다.

## 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 배포

### Vercel

- 프로젝트 루트: `mind-state-test-web`
- Build Command: `npm run build`
- Output Directory: `dist`
- `vercel.json` 포함

### Netlify

- Base directory: `mind-state-test-web`
- Build command: `npm run build`
- Publish directory: `dist`
- SPA 리다이렉트는 `netlify.toml`에 포함

## 주의 문구

이 테스트는 의학적 진단이 아니며, 정신건강의학과 진료나 전문가 상담을 대체하지 않습니다. 결과는 참고용으로만 사용해주세요.
