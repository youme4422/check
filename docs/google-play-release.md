# Google Play Release

This project is a personal safety check-in app. Store assets, descriptions, app name, and package identifiers should stay aligned with that purpose.

## Store listing

App name:
TaeB

Short description:
Record a daily safety check-in and reach emergency contacts quickly.

Full description:
TaeB helps you leave a simple daily safety signal and keep track of the next required check-in.

Core functions:
- record a check-in in one tap
- review recent check-in history
- set a 12, 24, or 48 hour interval
- keep emergency contacts ready for fast SMS or email actions
- receive reminder notifications before and at the deadline

Recommended upload assets:
- `play-store-assets/play-icon-512.png`
- `play-store-assets/feature-graphic-1024x500.png`
- `play-store-assets/phone-screenshot-01.png`
- `play-store-assets/phone-screenshot-02.png`
- `play-store-assets/store-listing-ko.txt`

## Privacy policy

A privacy policy URL is required in Play Console when the app handles personal information such as contact details or notifications.

Files prepared in this repo:
- `docs/privacy-policy-template.md`
- `docs/privacy-policy-ko.md`
- `src/config/appConfig.ts`

Before submission:
1. Confirm the privacy policy page stays publicly accessible without login.
2. Confirm the Settings screen opens the final URL.

Current configured policy URL:
- `https://sites.google.com/view/younmecheck/%ED%99%88`

Current app networking status:
- No app-owned backend API calls in the current client implementation.

Before release:
1. Make sure the privacy policy text matches the current local-only/manual-action behavior.

## Android build

Package name:
`com.jan26.checkinsafe`

Build commands:
- `npm run build:android`
- `npm run submit:android`

Latest validated AAB:
- `versionCode 9` build started on EAS (`ff814532-ace8-4c3f-8f9f-c2cd1dff8212`)
- `allowBackup=false`
- `fullBackupContent=false`
- blocked permissions verified removed:
  - `SYSTEM_ALERT_WINDOW`
  - `READ_EXTERNAL_STORAGE`
  - `WRITE_EXTERNAL_STORAGE`
  - `VIBRATE`

Latest AAB download:
- `https://expo.dev/artifacts/eas/9Hj8CSBquVzeSSptoMFE8z.aab`

## Final pre-submit check

1. Replace generated screenshots with real device screenshots if possible.
2. Verify the app name shown in the binary matches "TaeB".
3. Verify Data safety form answers match the local-only data flow.
4. Review the Data safety form in Play Console based on your actual data handling.
5. Make sure the privacy policy URL is live and publicly viewable before review submission.
