# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 - Dashboard
**Last completed:** 16 Recent Activity - Real Data
**Next:** 17 Analytics Charts - PostHog Data

---

## Progress

### Phase 1 - Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 - Profile Page

- [x] 05 Profile Page - Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 - Find Jobs Page

- [x] 09 Find Jobs Page - Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 - Job Details Page

- [x] 12 Job Details Page - Full UI
- [x] 13 Company Research Agent

### Phase 5 - Dashboard

- [x] 14 Dashboard Page - Full UI
- [x] 15 Stats Bar - Real Data
- [x] 16 Recent Activity - Real Data
- [ ] 17 Analytics Charts - PostHog Data

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
- Feature 04 schema is managed by InsForge migration `migrations/20260618032112_create-jobpilot-schema.sql`.
- Profile resume metadata stores both `resume_pdf_url` and `resume_pdf_key`; resume storage object keys use `{user_id}/resume.pdf` inside the private `resumes` bucket.
- Feature 04 added owner-only RLS for `profiles`, `agent_runs`, `jobs`, and `agent_logs`; `agent_logs` is append-only for authenticated users.
- PostHog follow-ups closed during Feature 05: pageview/pageleave capture is disabled because the project only allows the four explicit custom events; `identifyPostHogUser()` now initializes PostHog before calling `identify()` to avoid provider timing races.
- Feature 05 uses mock UI only. Save, upload, extraction, and resume generation buttons are inert until Features 06-08.
- Feature 06 keeps `/profile` as a Server Component for auth and data loading, with `ProfileInformationForm` as a Client Component only where form state and pending UI are needed.
- Feature 06 saves profile data through `actions/profile.ts`; profile rows are inserted with array-format `insert([payload])` on first save and updated with `.eq("id", userId)` on later saves.
- Feature 06 stores array fields from controlled UI state as JSON hidden inputs, then validates/parses them in the server action before writing `text[]` and `jsonb` columns.
- The installed `@insforge/sdk` storage upload method does not support an `upsert` option, so resume replacement removes the existing fixed object key before uploading the new PDF and saving both returned `url` and `key`.
- Feature 07 extracts only from the saved private resume object referenced by `profiles.resume_pdf_key`; extraction never writes to the database and the user must review and save manually.
- Feature 07 uses OpenAI PDF file input through `openai.responses.create()` instead of `pdf-parse`; `pdf-parse` v2 failed in Next.js dev because its `pdfjs-dist` worker resolved to a missing `.next/dev/server/chunks/pdf.worker.mjs` file.
- Feature 07 keeps OpenAI calls server-only in `agent/resume-extractor.ts`, using `gpt-4o`, JSON response format, and `OPENAI_API_KEY` from `.env.local`.
- OpenAI Responses JSON mode requires the request input message itself to contain the word `json`, so Feature 07's PDF extraction user message explicitly asks for valid json.
- Feature 07's extraction route keeps the normal InsForge Storage `.download()` path, but falls back to an authenticated direct object fetch when the private-bucket signed URL fetch fails after the current user's resume key has been verified.
- Feature 07 maps OpenAI `insufficient_quota` and 429 rate-limit responses to explicit user-facing messages with HTTP 429 instead of hiding them behind the generic extraction error.
- Feature 07 is verified working end to end after the OpenAI project quota/billing issue was resolved externally; Extract from Resume now downloads the saved private resume, sends it to OpenAI, and populates the profile form for review before manual save.
- Feature 08 requires a saved complete profile before resume generation; incomplete or missing profiles return friendly 400 responses and do not call OpenAI.
- Feature 08 keeps resume generation server-only in `agent/resume-generator.tsx` and `app/api/resume/generate/route.ts`; no PDF or OpenAI logic runs in client components.
- Feature 08 uses `@react-pdf/renderer` with `renderToBuffer()` and uploads a PDF `Blob` directly to InsForge Storage, avoiding filesystem writes.
- Feature 08 preserves the one-active-resume model by replacing `resumes/{user_id}/resume.pdf` and saving both `resume_pdf_url` and `resume_pdf_key`.
- Feature 09 keeps `/find-jobs` as an authenticated Server Component with mock-only UI components in `components/find-jobs`; no Adzuna calls, DB job queries, filtering, sorting, pagination state, or PostHog job-search events are wired until later features.
- Feature 09 follows `context/designs/find-jobs.png` for the visible table columns: Company, Role, Match Score, Salary Est., and Date Found. The Source badge from the broader build plan remains deferred because it is not present in the supplied reference image.
- Feature 10 adds `POST /api/agent/find` as the authenticated Adzuna discovery endpoint; the route validates input, loads the current user's complete profile, creates an `agent_runs` row, calls agent code, revalidates `/find-jobs`, and returns a success/error wrapper.
- Feature 10 keeps Adzuna access in `lib/adzuna.ts` using `URLSearchParams`, `category=it-jobs`, `results_per_page=10`, default country `us`, and no `where` parameter when location is empty.
- Feature 10 uses simple deterministic country detection for `gb`, `ca`, and `au`; ambiguous locations stay on the `us` default.
- Feature 10 centralizes the strong-match threshold as `MATCH_THRESHOLD = 70` in `lib/utils.ts`.
- Feature 10 keeps GPT-4o scoring in `agent/matcher.ts` with JSON normalization. Per-job scoring failures are logged to `agent_logs`, saved with a fallback score of 0, and do not crash the whole run.
- Feature 10 saves all successfully inserted Adzuna jobs as `source: 'search'`, then fires `job_found` for each saved row and `job_search_started` once per search.
- Feature 10 turns `SearchControls` into the real client submit bridge with loading, success, and friendly error states. Jobs table, filters, and pagination intentionally remain mock/static until Feature 11.
- Feature 11 keeps `/find-jobs` as the authenticated server-rendered data owner. The page normalizes URL search params, scopes every `jobs` query to `user_id`, selects only lightweight list columns, requests an exact count, and passes real rows into presentational list components.
- Feature 11 uses URL params as the list state contract: `q` for company/title search, `match=high|low` for score filters, `sort=newest|oldest` for date sorts, and `page` for 20-per-page pagination. Default state is omitted from the URL.
- Feature 11 uses `MATCH_THRESHOLD` for High/Low Match filtering, keeping the strong-match cutoff centralized.
- Feature 12 adds `/find-jobs/[id]` as an authenticated server-rendered detail page. It awaits Next.js 16 dynamic `params`, scopes the `jobs` query by both `id` and `user_id`, and calls `notFound()` for missing or inaccessible jobs.
- Feature 12 extends `lib/jobs.ts` and `types/jobs.ts` with detail-row parsing and formatting so React components receive normalized `JobDetails` data instead of raw database rows.
- Feature 12 keeps company research execution out of scope. The Company Research card renders the empty state and token-styled button shown in the design; the Browserbase/GPT dossier flow remains Feature 13.
- Feature 12 updates the shared app navbar to match the job details design: text-only nav items, active link via `text-accent`, a user icon, and a sign-out control in the header.
- Feature 12 links Find Jobs table company/title cells to `/find-jobs/[id]` so saved jobs can be opened through the normal list workflow.
- Feature 13 adds `POST /api/agent/research` as the authenticated company research endpoint. The route validates `jobId`, scopes the job by both `id` and `user_id`, requires the current user's complete profile, saves `jobs.company_research`, revalidates `/find-jobs/[id]`, and fires `company_researched` only after the save succeeds.
- Feature 13 keeps Browserbase and Stagehand server-only behind `lib/browserbase.ts`, `lib/stagehand.ts`, and `agent/research.ts`. The agent resolves Adzuna redirects with native server `fetch`, runs one Browserbase/Stagehand session, extracts the homepage plus up to three internal pages, closes Stagehand in `finally`, and logs thin/failing research to `agent_logs` with `job_id` and nullable `run_id`.
- Feature 13 synthesizes the exact 9-field `CompanyResearchDossier` with GPT-4o JSON output and normalizes/falls back to job/profile context so a complete dossier is still saved when browser research or synthesis is thin.
- Feature 13 turns `CompanyResearch` into the focused client action surface for the job details page. Existing saved dossiers render on page load, the button refreshes and overwrites saved research, and all visible styling uses project token classes only.
- Feature 14 replaces the `/dashboard` placeholder with the full mock dashboard UI from `context/designs/dashboard.png`, using `components/dashboard/*` for stat cards, recent activity, and three token-colored SVG chart cards.
- Feature 14 keeps dashboard data mocked only. Real InsForge stats, real activity, and PostHog chart data remain deferred to Features 15-17.
- Feature 14 updates the shared app navbar to match the dashboard reference: nav items include lucide icons, active state uses `border-b-2 border-accent text-accent`, and inactive items remain token-colored text links.
- Feature 15 wires the dashboard stats bar to real InsForge data through `lib/dashboard.ts`, keeping `/dashboard` as the authenticated server-rendered data owner and dashboard components presentational.
- Feature 15 queries only lightweight columns or head counts, scopes every query by `user_id`, and leaves Recent Activity plus analytics charts mocked until Features 16-17.
- Feature 15 computes optional week-over-week trend badges for total jobs and average match rate when a previous-week baseline exists; otherwise helpers use honest static copy like "All saved jobs" and "Across all jobs".
- Feature 16 wires Recent Activity to real InsForge data through `loadRecentDashboardActivity()`, merging completed `agent_runs` with jobs that have populated `company_research`.
- Feature 16 keeps the dashboard page as the authenticated data owner and keeps `RecentActivity` presentational through `activities` props.
- Feature 16 sorts activity by the best activity timestamp: `completed_at` for job searches and `updated_at` for company research saves, then displays the latest five entries.
- Feature 16 leaves analytics charts mocked until Feature 17.

---

## Notes

_Add notes here as the build progresses - workarounds, patterns, anything that differs from the context files._

- Feature 01 Homepage: `/` now matches `context/designs/landing-page.png` with top navigation, pastel hero, dashboard preview, split feature sections, testimonial, CTA band, and footer. Components live under `components/layout` and `components/homepage`. Verification note: lint/build could not be run in this shell because `node`, `npm`, `npm.cmd`, and `git` are not available on PATH.
- Feature 02 Auth: Added `@insforge/sdk`, corrected local InsForge env variable names in `.env.local`, created browser/server SDK helpers, OAuth start action, callback route, refresh route, protected-route proxy, `/login`, and lightweight protected placeholders for `/dashboard`, `/profile`, and `/find-jobs`. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 02 Auth polish: Added `signOut()` server action and Sign out buttons on `/profile` and `/find-jobs`; redesigned `/login` as a split auth panel matching the provided reference screenshot. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 02 Auth layout fix: Adjusted `/login` to use the shared navbar, `max-w-7xl`, standard `lg:grid-cols-2`, and fixed responsive text sizes so the split auth card matches the reference instead of stretching full-width. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 02 Auth component extraction: Moved the split login card UI and OAuth forms from `app/(auth)/login/page.tsx` into `components/auth/LoginCard.tsx`; the route now only handles search params, auth error mapping, navbar, and page shell. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 02 Auth review fixes: Corrected the `LoginCard` prop contract, restored OAuth forms to the `startOAuth` server action, moved page-shell layout back to `/login`, removed viewport-clamp and negative-tracking typography from the auth hero, and refreshed the UI registry to match the real component. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 03 PostHog Initialization: Added typed browser/server PostHog helpers, installed `posthog-node`, routed root layout analytics through the existing client provider, identified authenticated users from protected pages, and reset analytics on sign-out. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts. Note: `npm install` reported 2 moderate advisories; no audit fix was applied because it is outside this feature scope.
- Feature 04 Database Schema: Created and applied the initial InsForge schema migration for `profiles`, `agent_runs`, `jobs`, and `agent_logs` with constraints, indexes, updated-at triggers, immutable identity guards, grants, and owner-only RLS policies. Created the private `resumes` storage bucket. Verification: InsForge CLI confirmed all four tables exist, RLS is enabled on all four, 11 owner policies exist, and the `resumes` bucket is private.
- Feature 05 Profile Page - Full UI: Replaced the `/profile` placeholder with the complete mock profile UI from `context/designs/profile.png`: app navbar active state, attention banner, resume upload/generate card, profile information form, work experience card, education, job preferences, and save button. Added profile components under `components/profile` and token CSS helpers in `app/globals.css`. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 06 Profile Save Logic: Added `actions/profile.ts`, `lib/profile.ts`, and `types/profile.ts`; `/profile` now loads the current user's profile, pre-fills the form, calculates completion/missing fields, saves profile data to InsForge, uploads replacement resume PDFs to the private `resumes` bucket, stores both resume URL and key, fires `profile_completed` on the first complete save, and revalidates `/profile`. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 07 AI Profile Extraction from Resume: Added `openai`, `agent/resume-extractor.ts`, `app/api/resume/extract/route.ts`, and `components/profile/ProfileWorkspace.tsx`; the resume card now shows Extract from Resume after a saved resume exists, downloads the private PDF on the server, sends it to OpenAI as a base64 PDF file input for normalized profile JSON, and remounts the client form with extracted values for review before manual save. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts. Follow-up fix: removed `pdf-parse` after a Next.js dev worker resolution failure and fixed `next/image` logo dimension warnings by using matching image dimensions instead of CSS resizing.
- Feature 08 Resume PDF Generation from Profile: Added `@react-pdf/renderer`, `agent/resume-generator.tsx`, and `app/api/resume/generate/route.ts`; the resume card's Generate Resume from Profile button now calls the route, shows loading/success/error feedback, refreshes profile data, and links to the newly generated PDF. The route loads the authenticated user's complete profile, asks GPT-4o for grounded resume JSON, renders an A4 PDF server-side, uploads it to the private `resumes` bucket at the fixed active key, and updates the profile resume metadata. Verification: `npm.cmd run lint` passed after setting the local shell PATH to include Node; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 09 Find Jobs Page - Full UI: Replaced the `/find-jobs` placeholder with the mock UI from `context/designs/find-jobs.png`: active app navbar, search controls card, success banner, filter/search bar, six-row jobs table with token-colored match bars, and pagination. Components live in `components/find-jobs`. Verification: `npm.cmd run lint` passed after setting the local shell PATH to include Node; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 10 Adzuna Job Discovery: Added `lib/utils.ts`, `types/jobs.ts`, `lib/adzuna.ts`, `agent/matcher.ts`, `agent/adzuna.ts`, and `app/api/agent/find/route.ts`; wired `components/find-jobs/SearchControls.tsx` to submit real searches, create runs, call Adzuna, score jobs with GPT-4o, save jobs and logs to InsForge, and fire PostHog search/job events. Verification: `npm.cmd run lint` passed after setting the local shell PATH to include Node; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 11 Filter + Sort + Pagination: Added real InsForge-backed `/find-jobs` list querying, typed list/query helpers in `lib/jobs.ts` and `types/jobs.ts`, URL-driven filter/search/sort controls, real jobs table rows with empty/error states, 20-per-page pagination links, and automatic list refresh after a successful Adzuna search. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 12 Job Details Page - Full UI: Added `/find-jobs/[id]`, `components/job-details/*`, full job detail parsing, real user-scoped InsForge job loading, header/info cards/match reasoning/skills/job description/company research empty state/apply CTA, app navbar sign-out UI, and Find Jobs table links into detail pages. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts.
- Feature 13 Company Research Agent: Added `@browserbasehq/sdk`, `@browserbasehq/stagehand`, and `zod`; implemented server-only Browserbase/Stagehand helpers, `agent/research.ts`, `POST /api/agent/research`, typed/parsing support for `CompanyResearchDossier`, and the real job-details company research UI with loading/error/refresh states and persisted dossier rendering. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts; touched UI files scanned clean for hardcoded hex values and raw Tailwind color utilities. Note: `npm install` reported 19 advisories (17 low, 2 moderate); no audit fix was applied because it is outside this feature scope.
- Feature 13 polish: De-duplicated company research sources before rendering and before refreshed fallback saves, preventing duplicate React keys when Adzuna source/apply URLs repeat. Updated the dossier UI with a standalone Tech Stack pill row, token-colored icons before section titles, and cleaner bullet rows matching the supplied screenshot direction. Verification: `npm.cmd run lint` passed; `npm.cmd run build` passed after allowing network access for Google Fonts; `CompanyResearch.tsx` scanned clean for hardcoded hex values and raw Tailwind color utilities.
- Feature 14 Dashboard Page - Full UI: Replaced the `/dashboard` placeholder with the screenshot-matched mock dashboard: active app navbar, four stat cards, recent activity timeline, Company Research Activity bar chart, Jobs Found Over Time line/area chart, and Match Score Distribution bar chart. Added `components/dashboard/StatCard.tsx`, `StatsBar.tsx`, `RecentActivity.tsx`, `CompanyResearchChart.tsx`, `JobsFoundChart.tsx`, `MatchScoreChart.tsx`, and `AnalyticsCharts.tsx`. Verification: `npm.cmd run lint` passed after setting the local shell PATH to include Node; `tsc --noEmit` passed; touched dashboard/navbar files scanned clean for hardcoded hex values and raw Tailwind color utilities. `npm.cmd run build` could not be run because the required network escalation for Google Fonts was rejected by the environment usage limit.
- Feature 15 Stats Bar - Real Data: Added `types/dashboard.ts` and `lib/dashboard.ts`; `/dashboard` now loads real user-scoped totals for Total Jobs Found, Avg. Match Rate, Companies Researched, and Jobs This Week, then passes them into `StatsBar`. Verification: `npm.cmd run lint` passed after setting the local shell PATH to include Node; `tsc --noEmit` passed. Production build was not rerun because the previous required network escalation for Google Fonts was rejected by the environment usage limit.
- Feature 16 Recent Activity - Real Data: Extended `types/dashboard.ts` and `lib/dashboard.ts`; `/dashboard` now loads real user-scoped recent activity and passes it into `RecentActivity`. The feed merges completed job-search runs and company research saves, formats entries as "Found X jobs for [title]" and "Researched [company]", and shows a token-styled empty state when no activity exists. Verification: `npm.cmd run lint` passed after setting the local shell PATH to include Node; `tsc --noEmit` passed; touched dashboard files scanned clean for hardcoded hex values and raw Tailwind color utilities. Production build was not rerun because the previous required network escalation for Google Fonts was rejected by the environment usage limit.
