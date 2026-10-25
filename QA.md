# MediConnect QA

Revision: professional health workspace (October 2026).

## Scope

Patient registration/login → record upload → patient-approved doctor access → download → revocation → deletion. Also check responsive navigation, direct routes and refresh persistence.

## Automated checks

- Security unit tests: password salting/verification, supported file signatures, registration data types/roles/lengths, session digest behaviour.
- React production build with `CI=true` (warnings fail the build).
- End-to-end API regression and browser checks: results will be recorded below after deployment verification.

## Limitations

Testing cannot prove an application has no bugs. This is an academic prototype using synthetic data, not a certified medical system. See the README for unimplemented features and deployment tradeoffs.
