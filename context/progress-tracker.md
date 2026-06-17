# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 - Foundation
**Last completed:** 03 PostHog Initialization
**Next:** 04 Database Schema

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [ ] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

_Add decisions here as they are made during implementation._

- Homepage built as reusable App Router components: `Navbar`, `Hero`, `HowItWorks`, `Features`, `SuccessStory`, `CTASection`, and `Footer`.
- Landing page visuals rely on shared token-driven helpers in `app/globals.css` (`landing-panel`, `landing-grid`, `landing-hero-glow`, `landing-divider`) instead of component-level hardcoded color values.
- Landing page uses provided assets from `public/logo.png` and `public/images/` to match `context/designs/landing-page.png`.
- Auth uses InsForge's current SSR package path: `@insforge/sdk/ssr`, not the older `@insforge/ssr` examples still present in some local context docs.
- OAuth is server-owned: `actions/auth.ts` starts Google/GitHub sign-in with `skipBrowserRedirect`, `app/api/auth/callback/route.ts` exchanges `insforge_code`, and `/api/auth/refresh` handles session refresh.
- Next.js 16 route protection lives in `proxy.ts`; protected paths are `/dashboard`, `/profile`, and `/find-jobs`.
- PostHog browser initialization stays in a client provider under the server root layout. Server event capture uses `posthog-node` with `flushAt: 1`, `flushInterval: 0`, and `shutdown()` in the same helper.
- Current auth pages identify authenticated users from protected server pages and reset PostHog through a reusable client sign-out button before the existing server action runs.

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._

- Feature 01 Homepage: `/` now matches `context/designs/landing-page.png` with top navigation, pastel hero, dashboard preview, split feature sections, testimonial, CTA band, and footer. Components live under `components/layout` and `components/homepage`. Verification note: lint/build could not be run in this shell because `node`, `npm`, `npm.cmd`, and `git` are not available on PATH.
- Feature 02 Auth: Added `@insforge/sdk`, corrected local InsForge env variable names in `.env.local`, created browser/server SDK helpers, OAuth start action, callback route, refresh route, protected-route proxy, `/login`, and lightweight protected placeholders for `/dashboard`, `/profile`, and `/find-jobs`. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 02 Auth polish: Added `signOut()` server action and Sign out buttons on `/profile` and `/find-jobs`; redesigned `/login` as a split auth panel matching the provided reference screenshot. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 02 Auth layout fix: Adjusted `/login` to use the shared navbar, `max-w-7xl`, standard `lg:grid-cols-2`, and fixed responsive text sizes so the split auth card matches the reference instead of stretching full-width. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 02 Auth component extraction: Moved the split login card UI and OAuth forms from `app/(auth)/login/page.tsx` into `components/auth/LoginCard.tsx`; the route now only handles search params, auth error mapping, navbar, and page shell. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 02 Auth review fixes: Corrected the `LoginCard` prop contract, restored OAuth forms to the `startOAuth` server action, moved page-shell layout back to `/login`, removed viewport-clamp and negative-tracking typography from the auth hero, and refreshed the UI registry to match the real component. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 03 PostHog Initialization: Added typed browser/server PostHog helpers, installed `posthog-node`, routed root layout analytics through the existing client provider, identified authenticated users from protected pages, and reset analytics on sign-out. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts. Note: `npm install` reported 2 moderate advisories; no audit fix was applied because it is outside this feature scope.
