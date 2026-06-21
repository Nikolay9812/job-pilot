# Memory - Feature 10 Adzuna Job Discovery

Last updated: 2026-06-21 16:58 Europe/Berlin

## What was built

- Feature 10 Adzuna Job Discovery is complete and verified.
- Added `lib/utils.ts` with the centralized `MATCH_THRESHOLD = 70`.
- Added `types/jobs.ts` for shared job discovery response and match score types.
- Added `lib/adzuna.ts` for Adzuna search with `URLSearchParams`, `category=it-jobs`, `results_per_page=10`, default country `us`, no `where` parameter when location is empty, and simple deterministic detection for `gb`, `ca`, and `au`.
- Added `agent/matcher.ts` for GPT-4o job scoring against the saved profile with JSON normalization and fallback-safe results.
- Added `agent/adzuna.ts` for the discovery orchestration: search Adzuna, score each job, save jobs to InsForge, write `agent_logs`, update `agent_runs`, count strong matches, and fire `job_found`.
- Added `app/api/agent/find/route.ts` as the authenticated `POST /api/agent/find` endpoint. It validates input, loads the current user's complete profile, creates an `agent_runs` row, fires `job_search_started`, calls the agent, revalidates `/find-jobs`, and returns the standard success/error wrapper.
- Updated `components/find-jobs/SearchControls.tsx` from static mock UI to a client submit bridge with controlled inputs, loading state, success banner, and friendly error banner.
- Updated `context/progress-tracker.md` and `context/ui-registry.md`.

## Decisions made

- Feature 10 saves all successfully scored Adzuna jobs, not only strong matches. Strong matches are counted with `MATCH_THRESHOLD`, currently 70.
- Feature 10 keeps the table, filters, sorting, and pagination static/mock. Real querying, filtering, sorting, and pagination remain Feature 11.
- Country detection is intentionally simple and deterministic. Ambiguous location input stays on the `us` default.
- Per-job GPT-4o scoring failures do not fail the whole search. They are logged to `agent_logs`, saved with fallback score data, and the run continues.
- The run is marked failed only when the broader search/profile/database flow cannot complete.
- `job_search_started` fires once per search, and `job_found` fires for each successfully saved job.

## Problems solved

- Confirmed the local project uses `@insforge/sdk/ssr` and `insforge.database`, not older `@insforge/ssr` examples from some context docs.
- Added missing `lib/utils.ts` because project standards already referenced `MATCH_THRESHOLD` there.
- Preserved the project boundary that API routes stay thin and agent logic lives in `agent/`.
- Avoided raw Tailwind colors and hardcoded hex values in the updated search UI.
- Local shell still needs `C:\Program Files\nodejs` injected into `PATH` before `npm.cmd run lint` or `npm.cmd run build`.
- `git` is still not available on PATH in this shell, so git status/diff summaries could not be produced.

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
- Phase 3 Find Jobs Page:
  - `09 Find Jobs Page - Full UI` is complete
  - `10 Adzuna Job Discovery` is complete
  - `11 Filter + Sort + Pagination` is next
- Verification:
  - `npm.cmd run lint` passes after setting the local shell PATH to include Node.
  - `npm.cmd run build` passes after allowing network access for Google Fonts.
- A live authenticated Adzuna/OpenAI search was not run from the browser during this session; verification was static plus production build.

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and the required context files in order before implementation.
- Start Feature 11 Filter + Sort + Pagination from `context/build-plan.md`.
- Feature 11 should replace the mock table/filter/pagination data with real InsForge `jobs` queries scoped to the current user.
- Keep Feature 11 focused on list behavior: all/high/low match filters, company/title text search, match/newest/oldest sorting, 20-per-page pagination, and real result counts.
- Do not start Job Details Page work until Feature 11 is complete unless the build plan is explicitly changed.

## Open questions

- None currently known.
