# Play Console Declarations Checklist (2026-03-06)

Use these answers based on the current app implementation.

## Core app behavior

- Ads: `No`
- Account creation/login required: `No`
- App access restrictions: `None`
- Backend server data sync: `No`
- Automatic emergency messaging: `No`
- SMS/email sending behavior: `User manually opens device SMS/email app`

## Permissions and sensitive access

- Declared runtime permission: `POST_NOTIFICATIONS` only
- Not used: contacts read/write, location, call logs, SMS read/send, microphone, camera, health data
- Extra blocked permissions in config:
  - `AD_ID`
  - `SYSTEM_ALERT_WINDOW`
  - `READ/WRITE_EXTERNAL_STORAGE`
  - `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`, `READ_MEDIA_AUDIO`
  - `ACCESS_MEDIA_LOCATION`
  - `VIBRATE`

## Data safety form (recommended answers)

- Data collected: emergency contact info, check-in history, app settings
- Data processing location: on-device local storage
- Data shared to third parties: `No` (except user-initiated handoff to device SMS/email apps)
- Data deletion: supported through in-app reset
- Data encryption in transit: not applicable for app-owned backend transfer (none)

## Policy-sensitive claims to avoid in store listing

- Do not claim automatic rescue dispatch
- Do not claim medical diagnosis/treatment outcomes
- Do not claim automatic SMS or messenger sending

## Required URLs and docs

- Privacy policy URL must be public and reachable without login
- Privacy policy content must match current app behavior (no messenger auto-send, no backend transfer)
- Keep screenshots and listing text aligned with manual SMS/email action flow
