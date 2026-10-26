# MediConnect QA

Tested 25 October 2026 using synthetic accounts and documents.

## Scope

Patient registration/login → upload → patient-approved doctor access → download → revocation → deletion. Tested on a real Vercel deployment and a dedicated Neon database, not a mock backend.

## Automated evidence

- **4 security unit tests passed**: password salting/verification, supported file signatures, registration types/roles/lengths, session token digest behaviour.
- **40 API end-to-end checks passed** against the deployed service. The script is `tests/e2e-api.js`; it requires explicit `BASE_URL` and creates synthetic accounts.
- The API checks cover anonymous access, invalid signup, duplicate email case normalization, incorrect credentials, object-shaped login, cookie attributes, refresh-independent sessions, role restrictions, denied doctor access before consent, upload persistence, separate IDs for duplicate filenames, byte-for-byte downloads, cross-account read/delete denial, invalid file signatures, 2 MB limit, invalid/future dates, patient grants, doctor patient lists, granted reads/downloads, denied doctor deletion, revocation, audit history, owner deletion, cross-origin rejection, server-side logout invalidation and login persistence.
- Uploaded API-test files were removed. Synthetic test accounts and their audit entries remain, with no real patient information.
- Production builds passed with the original React setup and the final Vite toolchain. The final production JS is approximately 71 KB gzip and CSS approximately 7 KB gzip.

## Browser evidence

- Registration, login, refresh persistence, dashboard navigation and sharing form rendered correctly in connected Chrome. The final Vite/React Router build rendered an API-seeded synthetic record correctly in the patient library.
- Public home, approach, team and privacy navigation reviewed; team portraits loaded.
- Desktop and 390 px mobile dashboard reviewed. A mobile homepage overflow from decorative circles was identified and fixed; all four workspace tabs are visible on mobile after refinement.
- Browser search and category filters correctly show/hide an API-seeded record. Delete confirmation opens and can be cancelled without removing the record. Browser sign-out returns to login.
- Upload modal opens, traps focus and closes with Escape. The synthetic PDF download works.
- The browser extension blocked automated file selection because “Allow access to file URLs” is disabled locally. This is an automation limitation; file handling was verified independently through the deployed API. No claim is made that automated browser upload succeeded.

## Dependency scope

The original Create React App tree contained numerous reported vulnerabilities. It was replaced with Vite; unused client libraries were removed. The server dependencies were updated to patched Express and Multer versions. Final `npm audit` checks report **0 known vulnerabilities** in both the frontend and root/server lockfiles (including development dependencies).

## Production release

- Merged PR #1 into `master`; Vercel production branch tracking is set to `master`.
- Final Vite production deployment reached READY. Health, login, record listing and byte-exact PDF download passed after release.
- Vercel runtime error scan: no errors found in the selected one-hour window.
- Verified mobile homepage document width does not exceed the 390 px viewport.

## Honest limits

No test suite proves a website has zero bugs. Natural 24-hour permission expiration was not waited out; the database expiration condition is implemented, while immediate revocation was exercised. No full WCAG audit, penetration test, load test or clinical validation was performed. This is an academic prototype, not a certified medical system. See the README for unimplemented features and deployment tradeoffs.

## Theme and documentation update

- Scope: persistent light/dark switch, static gradients, full user walkthrough, engineering/contribution guides and future/business planning. No backend/API behaviour changed in this update; the 40 API checks above describe the prior core-flow verification, not a newly rerun suite.
- Vite production build passed: approximately 71.7 KB JS gzip and 8.0 KB CSS gzip; no new runtime dependency or animated background.
- Early-theme initializer exercised with saved dark/light values, system-dark default, invalid saved value and blocked storage; all five checks passed.
- Connected Chrome: first system-dark render, switch to light, reload persistence, route persistence, and cross-tab synchronisation checked. Dark signup, patient dashboard and upload dialog visually reviewed.
- Responsive checks at 768 px and 360 px: tablet menu and always-visible theme switch worked; mobile homepage/document width did not exceed the viewport in dark mode.
- Relative links in README/guide documents checked: no missing local targets. Original-versus-assisted attribution explicitly disclosed; business prices/revenue are labelled hypotheses.
