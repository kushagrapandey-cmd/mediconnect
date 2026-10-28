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

## Current consent and account update

Verified 26 October 2026 using synthetic data on the feature preview with the existing dedicated Neon database.

- 6 unit/security tests and the Vite production build pass.
- 40 core API regression checks pass.
- 49 consent/account checks pass: explicit scope, pending/denied requests, non-owner/self-approval denial, unselected/new-file isolation, authenticated preview and same-origin framing headers, record editing ownership/date validation, revocation, profile changes, session metadata, logout-all, recovery-key rejection/rotation/replay protection, password reset/change and session invalidation.
- Test documents were removed; synthetic accounts and application history remain.
- Public navigation and recovery page were inspected in the cloud browser. Authenticated workflows were tested through the API; no claim of full browser automation is made.
- Email sending remains unconfigured. Natural expiry was not waited out. No real UHI/ABDM integration was performed.

## Nearby-care addition — 28 October 2026

- Baseline: commit `64f5070`; local production builds in headless Chromium,
  390×900 and 1440×900, three fresh contexts per width. The browser and server ran
  in the same environment. Auth-me was stubbed as anonymous for isolation.
- Initial compressed JS: 76.91 KB → 79.89 KB; compressed CSS: 8.69 → 9.15 KB.
  Leaflet/map chunk 44.29 KB compressed JS + 6.36 KB CSS loads only after results.
- Local scripted scrolling (90 animation frames): p95 frame intervals stayed
  roughly 17–18 ms before and after. No horizontal overflow or JS page errors.
  These are controlled local measurements, not real-device or network guarantees.
- Mobile/desktop browser checks with synthetic provider responses passed:
  no idle map/provider requests even when scrolled to the section; ambiguous
  location selection; results; ten-row pagination; type filtering; geolocation;
  safe rendering of HTML-looking facility names; normal wheel scrolling over the
  map; upstream error feedback and removal of stale results.
- Existing eight tests plus two nearby-care validation/normalization tests pass.
- Preview provider verification: Nominatim returned HTTP 200 and two matching
  Gomti Nagar locations. Invalid coordinates returned HTTP 400 as intended.
  The original public Overpass service returned HTTP 503 in two attempts.
  Private.coffee also failed with POST and GET: the final deployment
  `dpl_8RabvaQkV5BxSvaTBQQwTxt5jN9K` logged `Map upstream failure TimeoutError`
  at the configured 20-second deadline and returned HTTP 503.
- RELEASE BLOCKED: facility lookup is not reliable enough. Production remains
  on `64f5070` / `dpl_FSg764EcPRwS4Mgrr1VC5okV8d84`; `master` was not changed.
  The experimental implementation is kept on `feat/nearby-care` only. No user
  accounts, records or permissions were modified. A separate provider cache
  table was created by preview tests and contains unlinked public location data.
  Do not advertise this feature as live or end-to-end verified.


## Nearby-care retry — 28 October 2026

The runtime hospital provider was replaced with a bundled, licensed OSM India
snapshot (9 October 2026) after external-provider failures. No claim is made that
those external APIs were fixed. Local checks found real results in Kanpur,
Lucknow, Delhi and Bengaluru, with first tile reads/scans taking 4–21 ms in this
runtime. Only nearby rows are returned to the client. All 11 tests pass, including
radius bounds, result ordering, supported types and empty out-of-coverage search.
The real deployment and browser verification below supersede the earlier release
block only after they pass; this is a separate data path from the failed Overpass
prototype.

### Release verification — 28 October 2026

The snapshot implementation was released as commit
`1c2005cf316a79049ae987b622beb3d346dab478`, production deployment
`dpl_47WgUuwpqqC8T3mQAJXTrGRsRyKG` (READY). This supersedes the historical
Overpass release block above; the external Overpass path is not used.

The public production homepage was checked in the cloud browser without login:
Gomti Nagar location selection → real nearby results → actual loaded OSM map
tiles → Hospital/Clinic/All filters → Directions URLs and ten-to-twenty-row
pagination. Light and dark theme controls remained usable. The DOM confirmed
no horizontal overflow, ten initial rows and twelve successfully loaded 256 px
map tiles. Normal page scrolling across the map was exercised. Browser warnings
observed were from the browser extension, not the application. The earlier local
390 px / 1440 px UI tests cover geolocation, failures and idle-request behavior;
the final cloud smoke check was desktop, not a real mobile-device measurement.

All 11 automated tests pass. Source metadata, ODbL attribution, snapshot date,
India-only coverage and limits are documented. Live screenshot:
`docs/nearby-care-live-20261028.jpg`. No patient accounts or records were changed.

## Account/session and document-cap concurrency regressions

Run `TEST_DATABASE_URL=postgresql://... npm test` against an isolated PostgreSQL
instance using a direct connection (not a transaction pooler). The database role
must be able to create schemas. The suite creates a randomly named schema, runs
the application's real bootstrap and HTTP handlers against real SQL, and removes
its schema afterward. It never reads or modifies existing application tables.
Without `TEST_DATABASE_URL`, these integration checks are explicitly skipped;
the existing unit tests still run. GitHub Actions supplies PostgreSQL 16 and runs
both suites on pull requests and pushes to master.

The seven regression cases cover:

- Recovery-key reset, email-link reset, and signed-in password change completing
  after a login reads the old password: no session or cookie may be issued.
- The reverse ordering for all three password paths: a reset waits for a login
  that has inserted its session, then revokes that session before returning.
- Two simultaneous uploads with 29 stored records: exactly one succeeds, the
  patient stays at 30, further uploads fail, and deleting a record frees a slot.

Session creation and password mutations lock the same `mc_users` row in a
READ COMMITTED transaction. The lock statement is separate from the credential
check/session insert or revocation so those operations receive a fresh snapshot
after a lock wait. The salted password hash acts as the credential version.
Uploads use the same per-patient row lock before a guarded count-and-insert;
separate patients can still upload concurrently. No schema migration is needed.
