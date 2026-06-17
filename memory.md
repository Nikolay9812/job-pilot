# Memory - Auth Login UI And Refactor

Last updated: 2026-06-17 10:31 Europe/Berlin

## What was built

- Feature 02 Auth is complete and documented.
- Added InsForge OAuth foundation earlier in the auth phase:
  - `actions/auth.ts` with `startOAuth()` and `signOut()`.
  - `app/api/auth/callback/route.ts` for OAuth callback exchange.
  - `app/api/auth/refresh/route.ts` for session refresh.
  - `proxy.ts` for protected routes.
  - Lightweight protected placeholders for `/dashboard`, `/profile`, and `/find-jobs`.
- Added Sign out buttons to `/profile` and `/find-jobs`.
- Refactored login UI:
  - `app/(auth)/login/page.tsx` owns navbar, footer, search param error mapping, and page shell.
  - `components/auth/LoginCard.tsx` owns the split auth card and Google/GitHub OAuth forms.
- Updated `context/ui-registry.md` with the current `Auth Login Page` pattern.
- Updated `context/progress-tracker.md` through the auth review fixes.

## Decisions made

- OAuth forms submit through the existing `startOAuth` server action, not custom `/api/auth/oauth/*` routes.
- `LoginCard` receives a resolved `errorMessage: string | null`; the route translates query params to human-readable copy.
- The login card uses token-driven classes only and keeps the visual split-card pattern:
  - left pane: `landing-hero-glow`
  - shell: `rounded-xl border border-border bg-surface shadow-card`
  - provider buttons: secondary button styling with lucide icons.
- The page shell remains in `/login`; `LoginCard` is card-only.
- Avoid viewport-clamp typography and negative tracking in the auth card.

## Problems solved

- Fixed a production TypeScript build failure caused by `page.tsx` passing `errorMessage` while `LoginCard` expected `error`.
- Fixed broken OAuth buttons that had been pointed at non-existent `/api/auth/oauth/google` and `/api/auth/oauth/github` routes.
- Restored the InsForge server-action OAuth flow via `startOAuth`.
- Updated stale UI registry notes so they match the actual component.
- Verified that `npm.cmd run lint` passes.
- Verified that `npm.cmd run build` passes after allowing network access for Google Fonts.

## Current state

- Phase 1 Foundation status:
  - `01 Homepage` complete.
  - `02 Auth` complete.
  - Next feature is `03 PostHog Initialization`.
- `/login` renders with shared `Navbar`, split `LoginCard`, and shared `Footer`.
- `/profile` and `/find-jobs` include Sign out buttons.
- Auth callback and refresh routes exist under `app/api/auth/`.
- No known build or lint blockers remain.

## Next session starts with

- Run `/remember restore`.
- Read `AGENTS.md` and required context files in order.
- Start Feature 03 PostHog Initialization from `context/build-plan.md`.
- Before touching PostHog, follow `context/library-docs.md` and load any relevant installed skill if available.

## Open questions

- Confirm the desired UX location for PostHog identify/reset calls after login/logout before implementation.
- Confirm whether the login page footer should remain visible under the auth card or be removed for a tighter auth-only screen.
