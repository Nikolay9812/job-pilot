# Memory - Feature 15 Stats Bar Real Data

Last updated: 2026-06-22 13:07 Europe/Berlin

## What was built

- Feature 15 Stats Bar - Real Data is complete.
- Added `types/dashboard.ts` with `DashboardStats` and `DashboardTrend`.
- Added `lib/dashboard.ts` for server-side, user-scoped InsForge dashboard stat loading.
- Updated `app/dashboard/page.tsx` to load real stats for the authenticated user and pass them to `StatsBar`.
- Updated `components/dashboard/StatsBar.tsx` to render values from props instead of mock data.
- Updated `components/dashboard/StatCard.tsx` to support optional positive and negative trend badges.
- Updated `context/progress-tracker.md` and `context/ui-registry.md`.

## Decisions made

- `/dashboard` remains the authenticated server-rendered data owner; `components/dashboard/*` remain presentational.
- Feature 15 only wires the four stat cards:
  - Total Jobs Found
  - Avg. Match Rate
  - Companies Researched
  - Jobs This Week
- Recent Activity and all analytics charts remain mocked until Features 16 and 17.
- Stats queries use lightweight `head` counts where possible and select only `match_score` for average calculations.
- Every dashboard stat query is scoped by `user_id`.
- Week-over-week trend badges are shown only when a previous-week baseline exists; otherwise helper text stays honest, e.g. "All saved jobs" and "Across all jobs".

## Problems solved

- The InsForge SDK uses Supabase-style PostgREST query builders, so `.select("id", { count: "exact", head: true })` works for count-only queries.
- `company_research IS NOT NULL` is implemented with `.not("company_research", "is", null)`.
- Local `node` is not on PATH by default in this shell; verification commands need the local Node install prepended to PATH.
- `npm.cmd run lint` passed.
- `tsc --noEmit` passed.
- Targeted raw color scan over touched dashboard code passed.
- Production build was not rerun because the previous required network escalation for Google Fonts was rejected by the environment usage limit.
- `git` is not available on PATH in this shell, so diffs could not be shown through git.

## Current state

- Phase 1 Foundation is complete.
- Phase 2 Profile Page is complete.
- Phase 3 Find Jobs Page is complete.
- Phase 4 Job Details Page is complete.
- Phase 5 Dashboard is in progress:
  - `14 Dashboard Page - Full UI` is complete.
  - `15 Stats Bar - Real Data` is complete.
  - `16 Recent Activity - Real Data` is next.
  - `17 Analytics Charts - PostHog Data` remains after that.
- `context/progress-tracker.md` currently marks Feature 15 complete and Feature 16 next.

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and the required context files in order before implementation.
- Implement Feature 16: Recent Activity - Real Data.
- Feature 16 should query recent `agent_runs` and jobs with populated `company_research`, merge/sort by timestamp, take the latest 5-10, and keep the existing recent-activity card visual pattern.

## Open questions

- None currently known.
