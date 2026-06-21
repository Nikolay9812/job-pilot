# Memory - Feature 08 Resume PDF Generation from Profile

Last updated: 2026-06-21 08:45 Europe/Berlin

## What was built

- Feature 08 Resume PDF Generation from Profile is complete and verified.
- Added `@react-pdf/renderer` to `package.json` / `package-lock.json`.
- Added `agent/resume-generator.tsx` for server-only GPT-4o resume content generation and A4 PDF rendering with `renderToBuffer()`.
- Added `app/api/resume/generate/route.ts` to authenticate the current user, load their saved profile, require profile completion, generate a PDF, upload it to InsForge Storage, update profile resume metadata, and revalidate `/profile`.
- Updated `components/profile/ResumeSection.tsx` so Generate Resume from Profile calls `/api/resume/generate`, shows loading/success/error feedback, updates the current resume link, and refreshes server-loaded profile data.
- Updated `types/profile.ts` with `GenerateResumeResponse`.
- Updated `context/progress-tracker.md`, `context/ui-registry.md`, and `context/library-docs.md`.

## Decisions made

- Resume generation requires a saved complete profile. Missing or incomplete profiles return friendly 400 responses and do not call OpenAI.
- Generated resumes are not job-specific; GPT-4o polishes the saved profile into resume-ready language without inventing facts.
- The app keeps one active resume only. Generated PDFs replace `resumes/{user_id}/resume.pdf` and update both `resume_pdf_url` and `resume_pdf_key`.
- AI and PDF rendering stay server-only. Client components only trigger the route and render user feedback.
- `@react-pdf/renderer` is used only in server code, with no filesystem writes.
- The generated PDF buffer is converted to a PDF `Blob` before InsForge upload because the installed `@insforge/sdk` storage `upload(path, file)` accepts `File | Blob` and does not support an `upsert` option.
- The route removes the fixed resume key before uploading the generated replacement, matching the existing one-active-resume storage pattern.
- OpenAI `insufficient_quota` and 429 rate-limit errors are mapped to explicit human-readable 429 responses, matching Feature 07.
- PDF styling avoids hardcoded hex values and raw Tailwind color classes.

## Problems solved

- Confirmed `@react-pdf/renderer` was not installed before Feature 08 and added it.
- Confirmed the current InsForge SDK storage upload type expects `File | Blob`, so the generated `Buffer` cannot be uploaded directly.
- `npm.cmd run lint` initially failed because `node` was not visible on PATH inside the npm script. Verification passed after temporarily prepending `C:\Program Files\nodejs` to PATH for that shell process.
- `git` is not available on PATH in this shell, so git status/diff summaries could not be produced.

## Current state

- Phase 1 Foundation is complete:
  - `01 Homepage`
  - `02 Auth`
  - `03 PostHog Initialization`
  - `04 Database Schema`
- Phase 2 Profile Page is complete:
  - `05 Profile Page - Full UI`
  - `06 Profile Save Logic`
  - `07 AI Profile Extraction from Resume`
  - `08 Resume PDF Generation from Profile`
- Current progress tracker status:
  - Phase: Phase 3 - Find Jobs Page
  - Last completed: 08 Resume PDF Generation from Profile
  - Next: 09 Find Jobs Page - Full UI
- Verification:
  - `npm.cmd run lint` passes when the local shell PATH includes Node.
  - `npm.cmd run build` passes after allowing network access for Google Fonts.
- npm install reported 2 moderate advisories; no audit fix was applied because it was outside Feature 08 scope.

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and the required context files in order before implementation.
- Start Feature 09 Find Jobs Page - Full UI from `context/build-plan.md`.
- Feature 09 is UI-only with mock data. No Adzuna, OpenAI matching, database filtering, or pagination logic yet.
- Before building Feature 09, use `/architect` if treating it as a complex UI feature.
- For styling, follow `context/ui-tokens.md`, `context/ui-rules.md`, and existing patterns in `context/ui-registry.md`; never use hardcoded hex values or raw Tailwind color classes.
- After Feature 09, update `context/progress-tracker.md` and `context/ui-registry.md`.

## Open questions

- None currently known.
