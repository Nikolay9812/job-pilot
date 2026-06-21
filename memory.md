# Memory - Feature 07 AI Profile Extraction from Resume

Last updated: 2026-06-21 07:12 Europe/Berlin

## What was built

- Feature 07 AI Profile Extraction from Resume is complete and verified working end to end.
- Added `agent/resume-extractor.ts` for server-only OpenAI resume extraction from saved PDF bytes.
- Added `app/api/resume/extract/route.ts` to authenticate the user, load the user's profile row, download the saved private resume, call the extractor, and return normalized profile JSON.
- Added `components/profile/ProfileWorkspace.tsx` as the client bridge between resume extraction and the profile form.
- Updated `components/profile/ResumeSection.tsx` with the `Extract from Resume` action, loading state, success/error messages, and callback into the profile workspace.
- Updated `components/profile/ProfileInformationForm.tsx` so extracted data can repopulate the controlled form for user review before manual save.
- Updated `types/profile.ts` with extraction response/data types.
- Updated `components/layout/Navbar.tsx` and `components/layout/Footer.tsx` to use matching `next/image` dimensions for `public/logo.png`, removing the aspect-ratio warning.
- Updated `context/library-docs.md`, `context/progress-tracker.md`, and `context/ui-registry.md`.

## Decisions made

- Feature 07 extracts only from the already-saved private resume referenced by `profiles.resume_pdf_key`; it does not process unsaved browser files.
- Extraction never writes directly to the database. It only fills the form, and the user must review/edit and click Save Profile.
- OpenAI calls stay server-only in `agent/resume-extractor.ts` and use `gpt-4o` through the Responses API.
- The implementation uses OpenAI PDF file input (`input_file` with base64 `file_data`) instead of a local PDF parser.
- `pdf-parse` was removed because its `pdfjs-dist` worker failed in Next.js dev/Turbopack by resolving to a missing `.next/dev/server/chunks/pdf.worker.mjs`.
- OpenAI JSON mode requires the request input text itself to include the word `json`; the extractor's user message explicitly asks for valid json.
- The extraction route first tries normal InsForge Storage `.download()`, then falls back to an authenticated direct object fetch with the same server client if the private-bucket signed URL fetch fails.
- The direct storage fallback is only used after verifying the saved resume key starts with the current user's id.
- OpenAI `insufficient_quota` and generic 429 rate-limit failures are mapped to explicit user-facing messages with HTTP 429.

## Problems solved

- Fixed the original `pdf.worker.mjs` failure by removing `pdf-parse` from the extraction path and sending the PDF directly to OpenAI.
- Fixed the OpenAI JSON mode validation error by including `json` in the input message text.
- Fixed the InsForge private storage download failure by adding the authenticated direct object fallback.
- Fixed the `next/image` logo warning by using rendered dimensions that match the actual displayed logo ratio instead of CSS resizing only one dimension.
- Identified that a later OpenAI `insufficient_quota` error was not an app bug. After the OpenAI project quota/billing issue was resolved externally, Extract from Resume worked.

## Current state

- Phase 1 Foundation is complete:
  - `01 Homepage`
  - `02 Auth`
  - `03 PostHog Initialization`
  - `04 Database Schema`
- Phase 2 Profile Page status:
  - `05 Profile Page - Full UI` complete.
  - `06 Profile Save Logic` complete.
  - `07 AI Profile Extraction from Resume` complete and verified working.
  - `08 Resume PDF Generation from Profile` not started.
- Verification:
  - `npm.cmd run lint` passes.
  - `npm.cmd run build` passes when network access is allowed for Google Fonts.
- Expected changed files from Feature 07:
  - `agent/resume-extractor.ts`
  - `app/api/resume/extract/route.ts`
  - `app/profile/page.tsx`
  - `components/profile/ProfileWorkspace.tsx`
  - `components/profile/ResumeSection.tsx`
  - `components/profile/ProfileInformationForm.tsx`
  - `components/layout/Navbar.tsx`
  - `components/layout/Footer.tsx`
  - `types/profile.ts`
  - `package.json`
  - `package-lock.json`
  - `context/library-docs.md`
  - `context/progress-tracker.md`
  - `context/ui-registry.md`
  - `memory.md`

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and the required context files in order before implementation.
- Start Feature 08 Resume PDF Generation from Profile from `context/build-plan.md`.
- Before implementing Feature 08, use `/architect` because it is a new complex feature.
- Feature 08 should add `POST /api/resume/generate`, read current profile data, use GPT-4o to generate professional resume content, render a PDF with `@react-pdf/renderer`, upload it to InsForge Storage at the existing resume key, and update `profiles.resume_pdf_url`.
- Preserve the Feature 07 pattern: AI operations are API-route triggered, agent logic lives under `agent/`, and profile data is not mutated until a route/action explicitly owns that mutation.

## Open questions

- None currently known.
