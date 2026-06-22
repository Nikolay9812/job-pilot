# Memory - Feature 13 Company Research Agent

Last updated: 2026-06-22 Europe/Berlin

## What was built

- Feature 13 Company Research Agent is complete and verified.
- Added dependencies: `@browserbasehq/sdk`, `@browserbasehq/stagehand`, and `zod`.
- Added server-only helpers:
  - `lib/browserbase.ts`
  - `lib/stagehand.ts`
- Added `agent/research.ts` for the full company research flow:
  - derives homepage URLs by following job source/apply redirects with native server `fetch`;
  - falls back to a normalized company homepage URL;
  - runs one Browserbase + Stagehand session;
  - extracts homepage plus up to three preferred internal pages;
  - closes Stagehand in `finally`;
  - synthesizes a 9-field dossier with GPT-4o;
  - falls back to job/profile data if browser research or synthesis is thin;
  - logs research failures to `agent_logs` with `job_id` and nullable `run_id`.
- Added `app/api/agent/research/route.ts`:
  - validates `{ jobId }`;
  - authenticates the current user;
  - loads only the current user's job and profile;
  - requires a complete saved profile;
  - saves the dossier to `jobs.company_research` scoped by both `id` and `user_id`;
  - revalidates `/find-jobs/[id]`;
  - fires `company_researched` only after save succeeds.
- Extended `types/jobs.ts` with `CompanyResearchDossier`, `ResearchCompanyResponse`, and `JobDetails.companyResearch`.
- Extended `lib/jobs.ts` to parse `company_research` into `companyResearch`.
- Updated `app/find-jobs/[id]/page.tsx` to select `company_research` and pass it into the research component.
- Reworked `components/job-details/CompanyResearch.tsx` into the client action surface:
  - calls `POST /api/agent/research`;
  - shows loading and friendly error states;
  - renders saved research on reload;
  - supports Refresh Research;
  - renders all 9 dossier fields.
- Polished the Company Research dossier UI:
  - Tech Stack renders as a standalone pill row with code icons;
  - section headings have token-colored lucide icons;
  - list fields render cleaner bullet rows;
  - sources are de-duplicated before rendering, fixing duplicate React key warnings from repeated Adzuna URLs.
- Updated `context/progress-tracker.md` and `context/ui-registry.md`.

## Decisions made

- Browserbase and Stagehand stay server-only behind `lib/` helpers and `agent/research.ts`; no browser-control code is imported into UI or route files.
- The API route owns authentication, user scoping, profile completeness checks, saving, revalidation, and PostHog capture.
- `CompanyResearch` is the only client component needed for this feature because it owns click/loading/error state and calls the route.
- Dossier rendering tolerates existing saved duplicate source URLs by de-duplicating in the UI, while refreshed research saves cleaner de-duplicated sources.
- Styling follows project token classes only; no raw Tailwind color classes or hardcoded hex values were introduced in touched UI files.

## Problems solved

- There is no local `/browser` or `/fetch` skill in `.agents`, `.codex`, or `skills-lock.json`; implementation used project docs plus official Browserbase/Stagehand docs.
- Stagehand v3 in the installed package supports `stagehand.extract(instruction, schema, options?)`.
- Stagehand's active page `goto` options use `timeoutMs`, not Playwright's `timeout`; build caught this and it was fixed.
- Duplicate `dossier.sources` values caused a React console warning for repeated `<li key={source}>`; fixed by de-duplicating sources before rendering and before refreshed fallback saves.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes after allowing network access for Google Fonts.
- Raw color scans over touched UI files passed.

## Current state

- Phase 1 Foundation is complete.
- Phase 2 Profile Page is complete.
- Phase 3 Find Jobs Page is complete.
- Phase 4 Job Details Page is complete:
  - `12 Job Details Page - Full UI`
  - `13 Company Research Agent`
- Feature 13 works end to end according to the user: research can run, save, render, refresh, and persist.
- Current next planned feature in `context/progress-tracker.md` is `14 Dashboard Page - Full UI`.
- Known npm note: installing Feature 13 dependencies reported 19 advisories, 17 low and 2 moderate. No audit fix was applied because it was outside scope.

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and the required context files in order before implementation.
- Start Feature 14 Dashboard Page - Full UI from `context/build-plan.md`.
- Feature 14 should build the dashboard UI with mock data first, matching existing app navbar/card/token patterns and deferring real stat/activity/chart data to Features 15-17.

## Open questions

- None currently known.
