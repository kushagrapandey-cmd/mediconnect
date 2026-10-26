# Contribution and AI assistance: an honest account

This document separates the original project, the recent AI-assisted revision, and work that still needs the original team's confirmation. It is not a claim that every line was written manually by the GitHub account holder.

## What the repository establishes

| Area                               | Evidence                                                                                                                                         | Safe attribution                                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Original application               | Baseline before `c9bcedd`: React screens, patient/doctor flows, Express routes, Mongoose user model and Google Drive upload/download/delete code | An existing project in Kushagra's repository, developed under the original college team. Exact person-by-person authorship is not established by this review.      |
| Original commit history            | Early commits include frontend files, navbar/footer changes and doctor dashboard work, attributed to Kushagra Pandey                             | Git records authorship metadata; this alone cannot prove who manually typed each line or whether assistance was used.                                              |
| Product direction for the revision | Kushagra requested a professional, working interview showcase and deployment; later requested themes, walkthroughs and a future/business plan    | Kushagra supplied the brief, selected the goals, owns the repository and controls acceptance. This does not imply he has personally reviewed every generated line. |
| Recent implementation              | Commits starting at `768b492`, PR #1, and later theme/documentation changes                                                                      | Generated/implemented with substantial ChatGPT/Codex coding assistance.                                                                                            |
| Recent validation                  | `QA.md`, security tests and deployed API regression script                                                                                       | Tests were implemented and run by the AI coding assistant in this session. Kushagra's own manual testing should be listed separately when completed.               |

The authenticated GitHub connector records these assisted commits under the connected user's identity. A commit saying “Kushagra Pandey” is **not** a reliable distinction between manually written and AI-generated code. This disclosure is more accurate than a made-up percentage.

## What the assistant implemented in this revision

- Audited the baseline and replaced plaintext authentication and unprotected record operations.
- Implemented salted password hashing, database-backed sessions, role/ownership checks, expiring doctor grants and activity history.
- Reworked the React UI, responsive layouts, file validation and ID-based record management.
- Replaced the localhost MongoDB/Drive deployment dependency with an isolated Neon PostgreSQL database; replaced CRA tooling with Vite and patched dependencies.
- Created/reran the recorded tests, configured Vercel, repaired production branch tracking and deployed.
- Added light/dark mode, preference persistence, static gradients, and the walkthrough/engineering/business documentation.
- Researched official ABDM/UHI/FHIR sources for the forward-looking integration roadmap.

## What Kushagra can claim, and what needs confirmation

**Supported by this conversation:** initiated the upgrade, specified requirements and presentation goals, brought the original repository, made the request to deploy, requested patient/doctor workflows and later documentation/theme improvements, and remains responsible for deciding what to present.

**Original development:** describe the code you personally wrote only where you can explain or demonstrate it. The baseline existed before the assistant's implementation. Ask teammates to confirm their own work; do not silently claim their contributions.

**Not established here:** independent clinical research, user interviews, hospital/lab partnerships, formal usability studies, paying customers, compliance approval, government integration, or independent manual authorship of the security refactor. These must not appear as completed achievements unless you have evidence.

The older team labels (development/database/design/backend) are retained as project-provided labels. They were not independently verified task by task.

## A research and contribution ledger to complete yourself

Keep dated evidence; do not fill blanks with guesses.

| Work item             | Your actual action                                                                | Evidence to attach                         | Status today                                |
| --------------------- | --------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| Problem selection     | Why did you choose fragmented medical records?                                    | Original proposal/notes                    | Needs your account                          |
| Original frontend     | Which routes/components did you build?                                            | Commit, file, explanation                  | Needs your confirmation                     |
| Original backend      | Which endpoints/data models did you implement?                                    | Commit or original code walkthrough        | Needs your confirmation                     |
| Team responsibilities | What did each teammate contribute?                                                | Teammate agreement/history                 | Not independently verified                  |
| Research              | Which official docs/papers did you personally read? What changed because of them? | Reading notes and source links             | Assistant research is documented separately |
| User discovery        | Who did you interview, with permission, and what did you learn?                   | Anonymised notes                           | Not yet established                         |
| Manual QA             | Which scenarios did you personally reproduce?                                     | Checklist and synthetic demo recording     | Add after testing                           |
| Current learning      | Which generated functions can you explain and modify unaided?                     | Small follow-up commit or live walkthrough | To demonstrate                              |
| Future ownership      | Which fixes/features did you implement after understanding the assisted version?  | Small focused commits and tests            | To build over time                          |

## How to explain the project in an interview

Use this only where the original-project statement is accurate for you:

> MediConnect started as our college project for organising patient records and connecting patient and doctor workflows. I later used substantial AI coding assistance to audit and refactor it, improve the UI, strengthen access controls, test the core flows and deploy it. I set the requirements and am working through the implementation so I can explain and maintain it. The deployed version uses React, Express and PostgreSQL; it is an academic prototype and does not yet integrate with UHI/ABDM.

After you personally review and understand the code, you can replace “am working through” with a specific, truthful statement about what you reviewed and changed. Do not say “I independently designed the session security” unless you actually did.

Do not say “100% self-built”, “production medical platform”, “UHI-integrated”, “zero bugs”, or “44 tests I personally wrote” for this revision. Prefer “40 API regression checks and four security tests were run during the assisted refactor; I can show the evidence and reproduce the demo.”

## A useful way to gain real ownership now

1. Explain `session`, `auth`, `canRead` and the grant SQL without reading a script.
2. Trace one upload from form → API → database → listing → download.
3. Reproduce denied access before consent and after revocation in two browsers.
4. Implement a small improvement yourself, such as preserving the selected dashboard tab in the URL. Explain the before/after and commit only that change.
5. Keep future AI-assisted changes labelled in PR descriptions, with your review notes and tests. Do not rewrite old history to manufacture independence.
