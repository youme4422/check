# check Google Play Release Guide

## 한국어

### 현재 프로젝트에서 반영된 배포 준비 항목

- Android 패키지명 고정: `com.jan26.check`
- `android.versionCode` 설정
- `expo-notifications` 플러그인 추가
- 알림 관련 최소 권한만 명시
- 광고 식별자 권한(`AD_ID`) 차단
- EAS `production` 빌드가 AAB(`app-bundle`)를 생성하도록 설정

### Google Play 게시 전 해야 할 일

1. 개인 개발자 계정이라면 Play Console의 앱 테스트 요구사항을 먼저 확인하고 필요한 비공개 테스트를 완료합니다.
2. Play Console 앱 대시보드에서 앱 액세스, 데이터 보안, 콘텐츠 등급, 대상 연령층, 광고 여부 설문을 정확히 작성합니다.
3. 아래 문서를 기준으로 스토어 등록 정보를 입력합니다.
4. `eas build -p android --profile production`으로 AAB를 생성합니다.
5. 내부 테스트 트랙에서 실제 기기로 알림, 문자 링크, 이메일 링크, 다국어 전환을 확인합니다.
6. 프로덕션 배포 전 `version`, `android.versionCode`, `ios.buildNumber`를 올립니다.

### 내부 테스트 권장 점검표

- 첫 실행 시 데이터가 정상 초기화되는지
- 체크인 후 2시간 전 / 마감 시점 알림이 예약되는지
- 알림 권한 거부 시 앱이 정상적으로 폴백하는지
- 긴급 연락처 저장 / 수정 / 삭제가 유지되는지
- `sms:` / `mailto:` 링크가 실제 단말 앱을 여는지
- 데이터 내보내기 JSON이 예상 키를 모두 포함하는지
- 한국어 / 영어 전환 시 모든 문구가 번역되는지

### 보안 및 정책 메모

- 이 앱은 백엔드를 사용하지 않으며 데이터는 단말 로컬 저장소에만 저장됩니다.
- 연락처와 체크인 기록은 외부 서버로 전송되지 않습니다.
- 광고, 분석 SDK, 위치 추적, 계정 로그인 기능이 없습니다.
- 민감한 의료 서비스 앱이 아니므로 의료 효능, 구조 보장, 응급 구조 자동화 같은 표현은 스토어 설명에서 피해야 합니다.

## English

### Release-ready items already applied

- Fixed Android package name: `com.jan26.check`
- `android.versionCode` is set
- `expo-notifications` plugin is configured
- Only minimum notification permissions are declared
- Advertising ID permission (`AD_ID`) is blocked
- EAS `production` build is configured to create an AAB (`app-bundle`)

### Tasks before publishing to Google Play

1. If you use a personal developer account, complete the required app testing steps in Play Console first.
2. Complete the Play Console declarations accurately: app access, data safety, content rating, target audience, and ads.
3. Use the documents below for store listing copy.
4. Generate an AAB with `eas build -p android --profile production`.
5. Validate notifications, SMS links, email links, and language switching on real devices in an internal test track.
6. Increment `version`, `android.versionCode`, and `ios.buildNumber` before production rollout.

### Security and policy notes

- The app has no backend and stores data locally on the device only.
- Contacts and check-in history are not sent to an external server.
- There are no ads, analytics SDKs, location tracking, or account login features.
- Avoid claiming medical guarantees or automatic emergency rescue in the store listing.
