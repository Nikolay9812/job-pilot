# Memory - Feature 04 Database Schema

Last updated: 2026-06-19 05:12 Europe/Berlin

## What was built

- Feature 04 Database Schema was architected, implemented, applied to InsForge, verified, and documented.
- Created and applied `migrations/20260618032112_create-jobpilot-schema.sql`.
- Added `profiles`, `agent_runs`, `jobs`, and `agent_logs` tables with constraints, indexes, `updated_at` triggers, immutable identity guard triggers, grants, and owner-only RLS policies.
- Created the private InsForge Storage bucket `resumes`.
- Updated `context/architecture.md` to include `resume_pdf_key`, `updated_at` fields for mutable tables, and the final resume object path.
- Updated `context/library-docs.md` so resume uploads persist both returned URL and object key.
- Updated `context/progress-tracker.md` to mark Feature 04 complete and set Feature 05 Profile Page - Full UI as next.
- Updated `context/ui-registry.md` with a no-visible-UI note for the database schema feature.

## Decisions made

- Feature 04 uses one InsForge migration for all app-owned public schema objects.
- Resume storage uses object keys shaped as `{user_id}/resume.pdf` inside the `resumes` bucket.
- `profiles.resume_pdf_url` and `profiles.resume_pdf_key` are both persisted for future resume upload/generation work.
- `work_experience`, `education`, and `company_research` remain `jsonb` for now because the product docs explicitly call for those fields and the data is bounded or whole-object oriented.
- RLS is owner-only on all four tables using `auth.uid()`.
- `agent_logs` is append-only for authenticated users: owners can select and insert, but not update or delete.
- `profiles`, `agent_runs`, and `jobs` allow owner updates, with immutable identity fields protected by trigger guards.

## Problems solved

- The shell did not have `npx`, `npm`, `node`, or `git` on PATH. Node tooling worked by prepending `C:\Program Files\nodejs` and calling the Windows shims directly.
- InsForge CLI was confirmed linked to the expected `JSM_JobPilot` project without saving any credentials to memory.
- Remote InsForge state initially had no migrations and no storage buckets.
- The migration applied cleanly.
- Storage bucket creation succeeded as private.
- Verification confirmed all four tables exist, RLS is enabled on all four, 11 owner policies exist, key schema additions are present, and the `resumes` bucket is private.
- `npm run lint` passes.
- `npm run build` passes when network access is allowed for Google Fonts.
- `git status` required `git -c safe.directory=C:/Users/Nikolay/vs-projects/job-pilot ...` because the sandbox user differs from the repo owner. It also emitted warnings about unreadable global git ignore config, but repo status still worked.

## Current state

- Phase 1 Foundation status:
  - `01 Homepage` complete.
  - `02 Auth` complete.
  - `03 PostHog Initialization` complete, with two known follow-up review questions still unresolved.
  - `04 Database Schema` complete.
- Next planned feature is `05 Profile Page - Full UI`.
- Expected changed files from this session:
  - `migrations/20260618032112_create-jobpilot-schema.sql`
  - `context/architecture.md`
  - `context/library-docs.md`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `memory.md`
- Known PostHog follow-ups from the previous session remain:
  - `PostHogIdentify` may call `identify()` before provider initialization finishes.
  - Manual `$pageview` capture still needs a decision because `context/code-standards.md` says only four custom events are allowed.

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and the required context files in order before implementation.
- Start Feature 05 Profile Page - Full UI from `context/build-plan.md`.
- Before building UI, use the relevant UI/Tailwind skills if styling work is involved and follow `context/ui-registry.md`.
- Consider resolving the two PostHog follow-ups before or alongside the next feature if they become relevant.

## Open questions

- Should manual `$pageview` tracking remain part of the PostHog setup even though current code standards restrict project events to four custom events?
- Should PostHog identify be moved into a provider/auth observer path so it is guaranteed to happen after initialization?
