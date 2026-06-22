# Memory - Feature 16 Recent Activity Real Data

Last updated: 2026-06-22 13:14 Europe/Berlin

## What was built

- Feature 16 Recent Activity - Real Data is complete.
- Extended `types/dashboard.ts` with `DashboardActivityItem` and `DashboardActivityTone`.
- Extended `lib/dashboard.ts` with `loadRecentDashboardActivity(userId)`.
- Updated `app/dashboard/page.tsx` to load dashboard stats and recent activity in parallel, then pass activity into `RecentActivity`.
- Updated `components/dashboard/RecentActivity.tsx` so it renders real activity from props instead of mock data.
- Added a token-styled Recent Activity empty state for users with no completed searches or company research yet.
- Updated `context/progress-tracker.md` and `context/ui-registry.md`.

## Decisions made

- `/dashboard` remains the authenticated server-rendered data owner; `components/dashboard/*` remain presentational.
- Feature 16 only wires Recent Activity. Dashboard charts remain mocked until Feature 17.
- Recent Activity merges two user-scoped sources:
  - completed `agent_runs`, displayed as `Found X jobs for [job title]`;
  - `jobs` rows with non-null `company_research`, displayed as `Researched [company]`.
- Activity sorting uses `completed_at` for job searches and `updated_at` for company research, falling back to `created_at` when needed.
- The feed renders the latest five entries.
- Completed searches use success-green activity dots; researched companies use info-blue activity dots.
- Empty activity keeps the existing dashboard card styling and uses a simple centered empty state.

## Problems solved

- Recent activity avoids reading heavy job JSON by selecting only lightweight columns from `agent_runs` and `jobs`.
- Every activity query is scoped by `user_id`.
- Company research activity uses `.not("company_research", "is", null)`.
- Existing `formatDateFound()` is reused for relative timestamps, keeping date language consistent across jobs and dashboard activity.
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
- Phase 5 Dashboard is almost complete:
  - `14 Dashboard Page - Full UI` is complete.
  - `15 Stats Bar - Real Data` is complete.
  - `16 Recent Activity - Real Data` is complete.
  - `17 Analytics Charts - PostHog Data` is next.
- `context/progress-tracker.md` currently marks Feature 16 complete and Feature 17 next.

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and the required context files in order before implementation.
- Implement Feature 17: Analytics Charts - PostHog Data.
- Feature 17 should replace the three mocked dashboard SVG charts with real PostHog-backed data:
  - Jobs Found Over Time from `job_found` events for the current user over the last 30 days;
  - Match Score Distribution from `job_found.matchScore`;
  - Company Research Activity from `company_researched` events for the current user over the last 7 days.
- Keep chart styling aligned with the existing dashboard SVG/card patterns unless the implementation requires a chart library change documented in context.

## Open questions

- None currently known.
