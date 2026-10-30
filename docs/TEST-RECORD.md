# Verification record

Verified October 30, 2026.

- `npm test`: 8 integration tests passed, 0 failed.
- `npm run build`: successful Vite production build.
- `npm run test:ui`: 1 end-to-end Chromium workflow passed, 0 failed.
- Desktop viewport: 1440 x 1000. Mobile screenshot: 390 x 844.
- Direct Mongoose connection to the existing Atlas cluster: successful.
- `npm audit --omit=dev`: 0 production dependency vulnerabilities reported at verification time.

The integration suite uses a disposable real MongoDB server and verifies:

1. Registration, bcrypt password storage, HttpOnly/SameSite cookies, login and logout.
2. Invalid registration, duplicate normalized email, and incorrect password rejection.
3. Full CRUD lifecycle and preservation of other fields during partial edits.
4. Cross-user list/read/update/delete access rejection.
5. Missing or forged session rejection.
6. Date, enum, object ID and ownership-injection validation.
7. CSRF custom-header and cross-origin rejection.
8. Authentication rate limiting.

The browser workflow verifies registration, assignment creation, editing, completion, completed-view filtering, deletion confirmation and sign-out. Actual screenshots are in `docs/screenshots`.

These checks do not establish final submission readiness, production hosting, team signatures, real student IDs/photos, live Agile board use, or individual member contributions.
