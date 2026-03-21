# Google Play Submission Checklist (2026-03-06)

## 1) Permissions

- [ ] `POST_NOTIFICATIONS` only (runtime permission)
- [ ] No SMS/Contacts/Location/Call Log permissions in final manifest
- [ ] Blocked permissions remain enforced in `app.json`
- [ ] Notification permission prompt appears only when user enables reminders

## 2) Privacy and Data Safety

- [ ] Privacy policy URL is public and opens without login
- [ ] Policy states local storage behavior and user-initiated `sms:` / `mailto:` flow
- [ ] Policy does not mention messenger auto-send or backend transfer
- [ ] Data Safety form says no third-party sharing by app backend
- [ ] In-app reset/delete flow works and is easy to find

## 3) Store Listing

- [ ] Short/Full description avoid medical guarantee and automatic rescue claims
- [ ] Listing clearly describes manual SMS/email actions
- [ ] Screenshots reflect current UI and feature set
- [ ] App icon and title are consistent across binary and store page
- [ ] Privacy policy URL and support email are included in listing metadata

## 4) Build and Release

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run doctor` passes
- [ ] EAS Android AAB build starts successfully
- [ ] Internal testing track smoke test completed before production rollout
