# Memory - PostHog Initialization Review

Last updated: 2026-06-17 20:52 Europe/Berlin

## What was built

- Feature 03 PostHog Initialization was implemented and documented.
- Added typed browser analytics helper in `lib/posthog-client.ts`.
- Added typed server analytics helper in `lib/posthog-server.ts` using `posthog-node`, `flushAt: 1`, `flushInterval: 0`, and `shutdown()`.
- Added `components/auth/PostHogIdentify.tsx` to identify authenticated users on protected pages.
- Added `components/auth/SignOutButton.tsx` to reset PostHog before the existing `signOut` server action runs.
- Updated `app/providers/posthog-provider.tsx` to initialize PostHog through the shared helper and capture manual pageviews.
- Added `posthog-node` to `package.json` and `package-lock.json`.
- Updated `context/progress-tracker.md` to mark Feature 03 complete and set Feature 04 Database Schema as next.
- Updated `context/ui-registry.md` with the Auth Utility Components pattern.

## Decisions made

- Root layout remains a Server Component; PostHog browser work stays inside a client provider.
- Project event helpers are typed around the four approved event names only:
  `job_search_started`, `job_found`, `profile_completed`, and `company_researched`.
- Server-side event capture is centralized so future server actions/API routes do not forget to call `shutdown()`.
- Sign-out analytics reset is handled in a reusable client button rather than duplicating `onClick` logic in protected placeholder pages.

## Problems solved

- Confirmed `posthog-js` was already present from the PostHog Wizard/current setup.
- Added missing approved server SDK dependency `posthog-node`.
- Verified there is no separate `instrumentation-client.ts` in the current workspace, so no duplicate wizard initialization file is currently active.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes after allowing network access for Google Fonts.

## Current state

- Phase 1 Foundation status:
  - `01 Homepage` complete.
  - `02 Auth` complete.
  - `03 PostHog Initialization` complete, but review found two follow-up issues to decide/fix.
  - Next planned feature is `04 Database Schema`.
- Review findings from the PostHog check:
  - Important: `PostHogIdentify` may call `identify()` before the provider's `initPostHog()` effect runs, because child effects can run before parent effects.
  - Important: `$pageview` is manually captured, but `context/code-standards.md` currently says the only allowed PostHog events are the four project events. Either update the standards to allow pageviews or remove manual pageview capture.
  - Minor: no duplicate initialization file was found despite the user's note that the PostHog Wizard had already initialized PostHog.
- No known lint or TypeScript build blockers remain.

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and required context files in order.
- Decide whether to fix the two PostHog review findings before Feature 04:
  - Ensure PostHog initialization happens before identify/reset/event helper calls.
  - Decide whether `$pageview` is an allowed analytics event for this project and update code or standards accordingly.
- After that, continue with Feature 04 Database Schema from `context/build-plan.md`.

## Open questions

- Should manual `$pageview` tracking remain part of the PostHog setup even though the current code standards restrict project events to four custom events?
- Should identify be moved into the provider/auth observer path so it is guaranteed to happen after PostHog initialization?
