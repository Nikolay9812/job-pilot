# Memory - Feature 06 Profile Save Logic

Last updated: 2026-06-19 18:32 Europe/Berlin

## What was built

- Feature 06 Profile Save Logic was implemented, verified, imprinted, and documented.
- Added `actions/profile.ts` with the `saveProfile` Server Action.
- Added shared profile types in `types/profile.ts`.
- Added profile parsing, completion, and normalization helpers in `lib/profile.ts`.
- Updated `app/profile/page.tsx` to load the current user's `profiles` row from InsForge, prefill the profile form, calculate completion percentage/missing fields, and pass real data into the profile components.
- Updated `components/profile/ProfileInformationForm.tsx` into a Client Component using `useActionState`, pending/save feedback, tag state for skills and industries, controlled work experience roles, hidden JSON fields for array/jsonb values, and a new Cover Letter Tone field.
- Updated `components/profile/ResumeSection.tsx` so the PDF file input participates in the main profile form through the HTML `form` attribute and displays a saved resume link when available.
- Updated `components/profile/ProfileAttentionBanner.tsx` to render real completion/missing fields and a complete profile state.
- Updated `app/globals.css` so the profile completion ring can render dynamic completion buckets and switch to success color at 100%.
- Updated `context/library-docs.md`, `context/progress-tracker.md`, and `context/ui-registry.md`.

## Decisions made

- `/profile` remains a Server Component for auth and data loading; `ProfileInformationForm` is client-only because it needs `useActionState`, local tag state, work role state, and pending UI.
- Profile persistence uses `actions/profile.ts`, not inline Server Actions in components.
- First profile save inserts with array-format `insert([payload])`; later saves update with `.eq("id", userId)`.
- The action scopes all profile reads/writes to the authenticated user ID from `insforge.auth.getCurrentUser()`.
- Array fields are edited in client state, submitted as hidden JSON, validated/normalized in the server action, and written to `text[]`/`jsonb` columns.
- Fully blank work experience cards remain visible in the UI but are filtered out before persistence.
- `cover_letter_tone` is now included in the UI and save payload because the schema/build plan includes it.
- Basic resume upload belongs to Feature 06; AI extraction and generated PDF resume remain deferred to Features 07 and 08.
- Installed `@insforge/sdk` storage `upload(path, file)` does not support an `upsert` option, so the implementation removes the existing fixed resume key before uploading a replacement to `{user_id}/resume.pdf`.
- `profile_completed` is fired server-side only when a profile transitions from incomplete/no row to complete.

## Problems solved

- Feature 05 form was mock-only; Feature 06 now pre-fills from InsForge and persists real profile data.
- Completion percentage and missing field tags now derive from the same helper used by the server page/action.
- Resume upload now stores both returned `url` and `key`, matching the database schema.
- The project docs previously said storage upload should use `upsert`; the installed SDK does not expose that option, so `context/library-docs.md` now documents the remove-then-upload replacement pattern.
- `npm.cmd run build` still needs network access for Google Fonts; build passes when that access is allowed.

## Current state

- Phase 1 Foundation is complete:
  - `01 Homepage`
  - `02 Auth`
  - `03 PostHog Initialization`
  - `04 Database Schema`
- Phase 2 Profile Page status:
  - `05 Profile Page - Full UI` complete.
  - `06 Profile Save Logic` complete.
  - `07 AI Profile Extraction from Resume` next.
  - `08 Resume PDF Generation from Profile` not started.
- Verification:
  - `npm.cmd run lint` passes.
  - `npm.cmd run build` passes when network access is allowed for Google Fonts.
- Expected changed files from this session:
  - `actions/profile.ts`
  - `app/globals.css`
  - `app/profile/page.tsx`
  - `components/profile/ProfileAttentionBanner.tsx`
  - `components/profile/ProfileInformationForm.tsx`
  - `components/profile/ResumeSection.tsx`
  - `context/library-docs.md`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `lib/profile.ts`
  - `types/profile.ts`
  - `memory.md`
- Known environment notes:
  - Node tooling works via `C:\Program Files\nodejs\npm.cmd`.
  - `git status` may require `git -c safe.directory=C:/Users/Nikolay/vs-projects/job-pilot ...` because the sandbox user differs from the repo owner.
  - Git may warn about unreadable global ignore config, but repo status still works.

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and the required context files in order before implementation.
- Start Feature 07 AI Profile Extraction from Resume from `context/build-plan.md`.
- Use the OpenAI docs skill and relevant PDF/InsForge docs before implementing extraction, because Feature 07 touches GPT-4o, PDF parsing, and profile form population.
- Preserve Feature 06 boundaries: resume upload already stores the PDF; Feature 07 should add extraction/review behavior without generating a PDF resume.

## Open questions

- None currently known.
