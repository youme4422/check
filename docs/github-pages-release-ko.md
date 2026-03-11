# GitHub Pages 배포 방법

## 목적

이 문서는 `check` 앱의 개인정보처리방침 페이지를 GitHub Pages로 공개하는 가장 간단한 절차를 정리한 문서입니다.

공개 대상 파일:

- `docs/privacy-policy.html`

공개 후 사용할 URL 형식:

- `https://younme0404.github.io/check/privacy-policy.html`

## 1. GitHub 저장소 준비

1. GitHub에서 `check` 저장소를 생성합니다.
2. 이 프로젝트 파일을 해당 저장소에 업로드합니다.
3. 기본 브랜치는 `main`을 사용하면 됩니다.

## 2. GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동합니다.
2. `Settings` > `Pages` 를 엽니다.
3. `Build and deployment` 의 `Source` 를 `Deploy from a branch` 로 선택합니다.
4. 브랜치는 `main` 을 선택합니다.
5. 폴더는 `/docs` 를 선택합니다.
6. `Save` 를 누릅니다.

## 3. 공개 주소 확인

GitHub Pages 배포가 완료되면 아래 주소로 접속합니다.

- `https://younme0404.github.io/check/privacy-policy.html`

확인 기준:

- 로그인 없이 열려야 합니다.
- 시크릿 창에서도 열려야 합니다.
- 404가 나오면 Pages 배포가 아직 끝나지 않았거나 설정이 잘못된 것입니다.

## 4. 앱 설정 확인

앱 내부 개인정보처리방침 링크는 이미 아래 주소로 맞춰져 있습니다.

- `src/config/appConfig.ts`
- `https://younme0404.github.io/check/privacy-policy.html`

실제 저장소 이름이 `check` 가 아니면 URL도 함께 수정해야 합니다.

예:

- 저장소 이름이 `taeb` 이면
- `https://younme0404.github.io/taeb/privacy-policy.html`

## 5. Play 제출 전 최종 점검

1. 브라우저 시크릿 창에서 정책 URL이 열리는지 확인
2. 앱 설정 화면에서 정책 버튼이 정상 열리는지 확인
3. Play Console 개인정보처리방침 URL에 같은 주소 입력

## 6. 참고

GitHub Pages는 정적 HTML 공개에 적합하며, Google Play 심사용 개인정보처리방침 링크로 사용하기 좋습니다.
