# 프로젝트 정리 메모

현재 작업 대상은 `Check In Safe` 앱의 Google Play 제출 준비본입니다.

## 핵심 설정 파일

- `app.json`: Expo 앱 이름, 패키지명, 권한 차단, 알림 채널, EAS 연결 정보
- `eas.json`: Android production AAB 빌드 프로필
- `package.json`: 실행, 점검, 자산 생성, Android 빌드/제출 스크립트
- `tsconfig.json`: TypeScript 설정
- `eslint.config.js`: 린트 설정

## 앱 코드 위치

- `App.tsx`: 앱 진입점
- `src/`: 화면, 저장소, 알림, 설정 관련 코드
- `assets/images/`: 앱 아이콘, 스플래시, 스토어 자산 원본
- `plugins/with-secure-android-manifest.js`: Android 백업 비활성화 강제 plugin

## Play 제출 관련 파일

- `play-store-assets/`: Play Console 업로드용 아이콘, 피처 그래픽, 스크린샷, 설명 문구
- `docs/google-play-release.md`: 제출 체크리스트와 빌드 상태
- `docs/privacy-policy-template.md`: 개인정보처리방침 초안
- `docs/privacy-policy-ko.md`: 최종 한글 개인정보처리방침 문구
- `docs/privacy-policy.html`: 공개용 정적 개인정보처리방침 페이지
- `docs/github-pages-release-ko.md`: GitHub Pages 배포 절차
- `src/config/appConfig.ts`: 개인정보처리방침 URL, 알림 채널 상수
- `tools/generate-play-assets.ps1`: Play 스토어 이미지 생성 스크립트

## 최신 검증 결과

- `expo doctor` 통과
- 최신 보안 검증 AAB: `versionCode 5`
- 확인 완료:
  - `allowBackup=false`
  - `fullBackupContent=false`
  - `SYSTEM_ALERT_WINDOW` 제거
  - `READ_EXTERNAL_STORAGE` 제거
  - `WRITE_EXTERNAL_STORAGE` 제거
  - `VIBRATE` 제거

## 현재 남은 수동 작업

1. Play Console에 최종 AAB와 `play-store-assets/` 업로드
2. Data safety 설문을 실제 동작 기준으로 입력
3. 개인정보처리방침 링크가 비로그인 상태에서도 열리는지 시크릿 창에서 확인

## 현재 개인정보처리방침 URL

- `https://sites.google.com/view/younmecheck/%ED%99%88`
