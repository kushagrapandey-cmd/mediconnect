# MediConnect ko samajhne ka engineering guide

Read this after the README's normal user walkthrough. “Feature use kar liya” aur “feature ka code samajh liya” alag stages hain.

## 1. Project kya karta hai?

Patient apni documents library maintain karta hai. Doctor ko access **patient** deta hai. Code sirf account locate karta hai; permission nahi deta. Abhi doctor role self-selected hai, isliye real doctor verification ka claim nahi hai.

Current flow: React UI → same-origin `/api` → Express → Neon PostgreSQL. Browser directly database se connect nahi hota.

## 2. GitHub, Git aur Vercel ka role

| Part                   | Actual role                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Local source           | Files edit/build karne ki jagah; `git status` shows uncommitted changes.                                                           |
| Git                    | Changes ko commits mein record karta hai; branch allows isolated work.                                                             |
| GitHub repository      | Source/history/documentation share karta hai. Isse app apne aap database nahi ban jaati.                                           |
| PR #1                  | Large refactor ka reviewable record: original problems, changes and validation.                                                    |
| `master`               | This repository's release branch. Do not assume the branch is named `main`.                                                        |
| Vercel Git integration | `master` push se production build/deploy; other branches create previews. A successful push does not guarantee a successful build. |
| Neon                   | Isolated PostgreSQL database. Rows survive page refresh/redeployment.                                                              |
| Environment variables  | `DATABASE_URL` server-side connection configuration. Never put it in frontend source or a `VITE_` variable.                        |

Check deployment status and the exact commit in Vercel before saying a change is live. Connector-generated Git authorship does not prove manual authorship; see [contributions](CONTRIBUTIONS.md).

## 3. Code ko kis order mein padhna hai?

1. [`front-end/src/App.jsx`](../front-end/src/App.jsx): router, auth bootstrap, logout, header.
2. [`front-end/src/shared.jsx`](../front-end/src/shared.jsx): API helper, Auth context, record list, reusable modal.
3. [`front-end/src/AuthPage.jsx`](../front-end/src/AuthPage.jsx): form values → signup/login → authenticated user state.
4. [`front-end/src/Dashboard.jsx`](../front-end/src/Dashboard.jsx): role-based screens, fetch/refresh, grant/revoke, download/delete.
5. [`front-end/src/UploadModal.jsx`](../front-end/src/UploadModal.jsx): `FormData` and file selection. JSON is not used for the upload body.
6. [`back-end/server.js`](../back-end/server.js): route by route, starting with `session`, `auth`, `patient`, `doctor`, `canRead`.
7. [`back-end/security.js`](../back-end/security.js): scrypt, digest, signature checks, signup validation.
8. [`back-end/db.js`](../back-end/db.js): lazy driver connection and idempotent bootstrap.
9. [`front-end/src/ThemeToggle.jsx`](../front-end/src/ThemeToggle.jsx), [`theme.css`](../front-end/src/theme.css), [`theme-init.js`](../front-end/public/assets/theme-init.js): system preference, saved preference, early paint and semantic colour surfaces.
10. [`tests`](../tests): verify assumptions against code; tests do not prove zero bugs.

## 4. Authentication: step by step

- Signup validates types, name/email/password lengths and `patient`/`doctor` role. Email is trimmed/lowercased.
- `hashPassword` creates a random salt and derives a hash with asynchronous scrypt. Plaintext is not stored.
- After signup/login, `session` creates a random 32-byte token. Browser gets it in `mc_session`, an HttpOnly cookie; the database stores the token's SHA-256 digest.
- `auth` reads the cookie, hashes the token and looks for a non-expired matching session joined to its user.
- `safeUser` returns profile fields without the password hash.
- App startup calls `/api/auth/me`, restoring the user after refresh.
- Logout deletes the current session from the database and clears its cookie. Other independently created sessions are not globally revoked.

**Authentication** means “kaun ho?” **Authorization** means “ye particular action/record access kar sakte ho?” A logged-in user is not automatically allowed to read another patient's files.

Cookie flags: HttpOnly limits JS access; Secure on Vercel sends it over HTTPS; SameSite=Lax helps restrict cross-site cookie sending. Explicit origin checks reject cross-site mutations that supply a different Origin. These are controls, not a claim of complete CSRF/XSS protection.

## 5. Records: step by step

1. React builds `FormData` containing `file`, `title`, `category`, `recordDate`.
2. Express authenticates and requires a patient role before processing the upload.
3. Multer buffers one file in memory with a 2 MB file limit.
4. The API checks content signatures for PDF/PNG/JPEG, title/category/date, rate and account quota.
5. A UUID identifies the record. Metadata and base64 file content are persisted together.
6. Listing returns metadata, not the base64 content.
7. Download loads by UUID and calls `canRead`. It sends original file bytes as an attachment.
8. Deletion requires patient role and an owner ID match; a filename is never sufficient.

Duplicate filenames are safe because identification uses IDs. Signature checking is not antivirus scanning and does not guarantee a PDF is harmless. The current title/date/category are user-provided metadata, not clinically verified assertions.

## 6. Consent in this prototype

Patient enters a specific doctor's code → `mc_grants` stores that patient/doctor pair with an expiry → doctor sees the active patient in `/api/patients` → every view/download checks the active grant again.

- Grant covers the whole library, including documents uploaded later.
- Regrant updates the pair's expiry to 24 hours from the new grant.
- Revocation deletes the pair; a previously rendered list may remain on screen, but its next download is denied by the server.
- A downloaded copy cannot be recalled.
- This app-level grant is not an ABDM consent artefact and must never be represented as one.

## 7. Database tables

| Table         | Purpose                                     | Important relationship                                    |
| ------------- | ------------------------------------------- | --------------------------------------------------------- |
| `mc_users`    | Account, role, hashed password, unique code | User ID is the account identity.                          |
| `mc_sessions` | Hashed session tokens and expiry            | Many sessions can reference one user.                     |
| `mc_records`  | File bytes and metadata                     | `owner_id` references a user.                             |
| `mc_grants`   | Time-limited doctor access                  | Composite key prevents duplicate patient/doctor pairs.    |
| `mc_audit`    | Activity history                            | Owner identifies the patient whose records were affected. |
| `mc_limits`   | Rate counter and window expiry              | Key is a digest of the relevant rate-limit identifier.    |

Foreign keys preserve references. Parameterized SQL separates values from query structure. A bootstrap transaction and advisory lock serialize concurrent schema creation. For a larger product, use explicit versioned migrations, indexes, retention jobs and restore drills rather than relying on request-time schema setup.

## 8. Why these choices? Explain both benefit and cost

| Choice                           | Why used here                                                                                     | Limitation / alternative                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| React + Express retained         | Existing project skills/code remain useful; no need to replace the whole framework                | Large dashboard can later be split into feature hooks/components.                                                                                 |
| PostgreSQL on Neon               | Existing free Vercel integration made real persistence deployable; relations suit grants/sessions | Original MongoDB could also support this design. MongoDB was not “incapable”; no cloud instance was connected here. Current revision is not MERN. |
| Database-backed sessions         | Immediate server-side revocation without a JWT denylist; no token in localStorage                 | Requires a database lookup; high-scale deployment needs indexed/session lifecycle design.                                                         |
| Scrypt                           | Salted password derivation using Node's crypto, no external hashing service                       | Parameters, abuse protection and recovery flows still need formal review before real users.                                                       |
| Files in database                | Keeps a bounded demo private and avoids public file URLs/additional services                      | Base64 costs about 33% storage overhead; loading whole files is not a scalable object-storage design.                                             |
| Same-origin API                  | Fewer deployment/CORS mistakes; cookie flow is simpler                                            | Any future separate API origin needs deliberate CORS/cookie configuration.                                                                        |
| Vite                             | Removes the obsolete CRA toolchain and reduces unnecessary dependencies                           | A build tool, not a replacement for React or a security guarantee.                                                                                |
| Static CSS gradients             | Attractive themes without image downloads, blur stacks or animation loops                         | Actual scrolling/FPS has not been benchmarked across devices.                                                                                     |
| CSS variables + local preference | One theme control across routes; stores only a UI preference                                      | Preference is per browser, not synced to the user's database profile.                                                                             |
| React state for search/filter    | Fast and sufficient for the bounded 30-record library                                             | Larger datasets need server pagination/search and accessible table semantics.                                                                     |

## 9. API map

| Endpoint                              | Method     | Who / purpose                            |
| ------------------------------------- | ---------- | ---------------------------------------- |
| `/api/health`                         | GET        | Public service/database readiness        |
| `/api/auth/signup`, `/api/auth/login` | POST       | Create account / establish session       |
| `/api/auth/me`                        | GET        | Current authenticated profile            |
| `/api/auth/logout`                    | POST       | Invalidate current session               |
| `/api/records`                        | GET / POST | Patient's own metadata / upload          |
| `/api/records/:id/download`           | GET        | Owner or currently authorised doctor     |
| `/api/records/:id`                    | DELETE     | Owner patient only                       |
| `/api/grants`                         | GET / POST | Patient lists/grants active sharing      |
| `/api/grants/:code`                   | DELETE     | Patient revokes that doctor's grant      |
| `/api/patients`                       | GET        | Doctor's currently consenting patients   |
| `/api/patients/:code/records`         | GET        | Doctor opens a permitted patient library |
| `/api/activity`                       | GET        | Patient's latest 30 activity entries     |

## 10. Interview questions to practise without memorising buzzwords

- Why is knowing a patient code insufficient? Show the authorization check.
- Why is a random UUID insufficient by itself? It makes guessing harder but cannot replace permission checks.
- How does refresh preserve login? Explain cookie → hashed session → `/auth/me`.
- What happens if permission is revoked after the list was loaded? Explain rechecking on download.
- Why not just use localStorage? It would not provide shared, server-enforced persistence or authorization.
- Why not JWT? Both can work; explain this application's revocation tradeoff.
- Is PostgreSQL inherently more secure than MongoDB? No; implementation and deployment controls matter.
- What happens if a database write succeeds but a later audit write fails? Several operations are separate calls today; transactional domain writes/outbox are future reliability work.
- Is the quota fully concurrency-proof? The count-before-insert check can race. Add transactional locking/atomic quotas before unrestricted usage.
- Is an activity timeline an immutable audit log? No.
- What did AI implement and what did you personally do? Use the contribution ledger, not Git author names or invented percentages.
