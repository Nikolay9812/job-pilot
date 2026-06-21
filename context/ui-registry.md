# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Landing Page Rebuild

File: app/page.tsx, components/layout/Navbar.tsx, components/layout/Footer.tsx, components/homepage/*
Last updated: 2026-06-16

| Property         | Class                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| Background       | Page `bg-background`; section shells `landing-panel bg-surface`; hero/CTA `landing-hero-glow`; preview bands `bg-surface-tertiary` / `bg-surface-muted` |
| Border           | `border-b border-border` navbar; section shells use `landing-panel`; feature rows `border-t border-border`, `border-b border-border`, accent rows `border-l-2 border-accent` / `border-l-2 border-success` |
| Border radius    | CTA buttons via `landing-button-*`; dashboard image `rounded-[26px]`; feature images `rounded-[24px]`; testimonial avatar `rounded-full` |
| Text - primary   | Hero/section headings `text-[clamp(...)] font-semibold leading-[~1] text-text-slate`; feature item titles `text-xl font-semibold leading-7 text-text-slate` |
| Text - secondary | Body copy `text-lg font-normal leading-8 text-text-slate-medium` or `text-text-slate`; footer/nav `text-base font-medium leading-6 text-text-slate` |
| Spacing          | Page wrapper `mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8`; hero/CTA `px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24`; feature rows `px-8 py-9 sm:px-12 lg:px-16`; dividers `h-28` |
| Hover state      | Nav/footer links `hover:text-text-primary`; CTAs use shared `landing-button-primary` and `landing-button-secondary` hover states |
| Shadow           | Hero dashboard image `landing-browser-shadow`; jobs image `landing-card-shadow`; otherwise none |
| Accent usage     | Primary CTAs through `landing-button-primary`; first feature row `border-accent`; second split-panel highlighted row `border-success`; testimonial eyebrow `text-accent` |

**Pattern notes:**
The homepage mirrors `context/designs/landing-page.png` as a centered 1440px landing canvas. Product visuals come from `public/logo.png`, `public/images/dashboard-demo.png`, `public/images/jobs-lists.png`, `public/images/agnet-log.png`, and `public/images/user-icon.png`. Landing sections should keep white card shells, token-colored borders/text, striped `landing-divider` gaps, and asset-led product previews. Shared logo images use matching `next/image` width/height props for their rendered size instead of CSS height overrides, avoiding aspect-ratio warnings.

### Auth Login Page

File: app/(auth)/login/page.tsx, components/auth/LoginCard.tsx
Last updated: 2026-06-17

| Property         | Class                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| Background       | Page `bg-background`; shell/card `bg-surface`; left pane `landing-hero-glow`; error banner `bg-surface` |
| Border           | Card/buttons/badge `border border-border`; split divider `border-b border-border` / `lg:border-r`; error banner `border border-error` |
| Border radius    | Auth shell `rounded-xl`; buttons/error banner `rounded-md`; security badge `rounded-full` |
| Text - primary   | Hero heading `text-5xl sm:text-6xl lg:text-7xl font-semibold leading-none text-text-slate`; form heading `text-3xl font-semibold leading-9 text-text-primary`; buttons `text-sm font-medium leading-5 text-text-primary` |
| Text - secondary | Body `text-base sm:text-lg font-normal leading-7 text-text-secondary`; labels/help/nav `text-sm font-medium leading-5 text-text-secondary`; error `text-error` |
| Spacing          | Page wrapper `max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8`; card `max-w-5xl`; left/right panes `p-8 sm:p-10`; button stack `mt-8 grid gap-3`; buttons `px-4 py-2` |
| Hover state      | Buttons `hover:bg-surface-secondary`; focus `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent` |
| Shadow           | Auth shell and badge `shadow-card`; buttons none |
| Accent usage     | Left pane uses shared `landing-hero-glow`; badge icon and Google icon `text-accent`; focus outline `outline-accent` |

**Pattern notes:**
Auth screens use the shared top navbar and a centered split card with `lg:grid-cols-2`: persuasive context on a softly glowing token pane, provider selection on a white pane. The route file owns URL/search-param handling and page shell; `components/auth/LoginCard.tsx` owns only the two-pane card UI and OAuth provider forms. Provider buttons submit through the `startOAuth` server action, use lucide icons, and keep full-width secondary-button styling with token borders and token hover states.

### Protected Placeholder Pages

File: app/dashboard/page.tsx, app/profile/page.tsx, app/find-jobs/page.tsx
Last updated: 2026-06-17

| Property         | Class                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| Background       | Page `bg-background`; placeholder panel `bg-surface` |
| Border           | Panel `border border-border` |
| Border radius    | Panel `rounded-xl` |
| Text - primary   | Heading `text-2xl font-semibold leading-8 text-text-primary` |
| Text - secondary | Body `text-sm font-normal leading-5 text-text-secondary`; eyebrow `text-xs font-medium uppercase leading-4 text-accent` |
| Spacing          | Page wrapper `px-4 py-12 sm:px-6 lg:px-8`; panel `p-6`; heading `mt-3`; body `mt-2` |
| Hover state      | Sign-out button `hover:bg-surface-secondary`; focus `focus-visible:outline-accent` |
| Shadow           | Panel `shadow-card` |
| Accent usage     | Eyebrow `text-accent` |

**Pattern notes:**
These are temporary protected-route placeholders for auth verification only. Profile and Find Jobs include a secondary sign-out form button (`rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium`) so authenticated placeholder pages can clear the SSR session.

### Auth Utility Components

File: components/auth/SignOutButton.tsx, components/auth/PostHogIdentify.tsx
Last updated: 2026-06-17

| Property         | Class                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| Background       | Button `bg-surface`; `PostHogIdentify` renders no visible UI |
| Border           | Button `border border-border` |
| Border radius    | Button `rounded-md` |
| Text - primary   | Button `text-sm font-medium leading-5 text-text-primary` |
| Text - secondary | None |
| Spacing          | Form `mt-6`; button `min-h-10 px-4 py-2` |
| Hover state      | Button `hover:bg-surface-secondary`; focus `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent` |
| Shadow           | None |
| Accent usage     | Focus outline `outline-accent` |

**Pattern notes:**
Reusable auth utility components keep analytics behavior out of placeholder pages while preserving the exact secondary-button visual pattern already used by protected placeholders. `SignOutButton` resets PostHog before submitting the existing server action. `PostHogIdentify` is intentionally invisible and should remain styling-free.

### Database Schema

File: migrations/20260618032112_create-jobpilot-schema.sql
Last updated: 2026-06-18

No visible UI components were added for Feature 04. The database schema feature creates backend persistence only, so existing visual patterns remain unchanged.

### Profile Page Full UI + Save Logic + Resume Extraction + Resume Generation

File: app/profile/page.tsx, components/layout/Navbar.tsx, components/profile/*
Last updated: 2026-06-21

| Property         | Class                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| Background       | Page `bg-background`; cards `bg-surface`; muted work card `bg-surface-secondary`; tags `bg-surface-muted`; upload zone uses `profile-upload-zone` token CSS |
| Border           | Cards `border border-border`; attention banner `border border-error` or `border-success`; app navbar `border-b border-border`; inputs `border border-border`; section dividers `border-t border-border`; save/extract messages `border-success` / `border-error` |
| Border radius    | Cards `rounded-xl`; work item `rounded-lg`; inputs/buttons `rounded-md`; completion ring `rounded-full`; missing badges `rounded-sm` |
| Text - primary   | Card headings `text-2xl font-semibold leading-8 text-text-primary`; section headings `text-lg font-semibold leading-7 text-text-primary`; body emphasis `text-sm font-semibold leading-5 text-text-primary` |
| Text - secondary | Help copy `text-sm font-medium leading-5 text-text-secondary`; labels `text-xs font-semibold uppercase leading-4 text-text-secondary`; placeholders `placeholder:text-text-muted`; disabled add-role text `disabled:text-text-muted` |
| Spacing          | Page wrapper `max-w-[980px] px-4 py-8`; page stack `gap-8`; cards `p-8`; form sections `mt-10 pt-10`; field grid `gap-6`; inputs `px-4 py-2` |
| Hover state      | Secondary controls `hover:bg-surface-secondary` / `hover:bg-surface-tertiary`; primary controls `hover:bg-accent-dark`; app nav inactive `hover:text-text-primary`; focus `focus-visible:outline-accent` and input `focus:ring-1 focus:ring-accent`; primary disabled states `disabled:cursor-not-allowed disabled:bg-accent-light disabled:text-accent` |
| Shadow           | Cards/buttons/icon well use `shadow-card`; inputs use `shadow-sm` |
| Accent usage     | Primary buttons `bg-accent text-accent-foreground`; active app nav `border-accent text-accent`; upload icon/current resume link/add role `text-accent`; checkbox `accent-accent`; completion ring uses token CSS with `--color-error` or `--color-success` |

**Pattern notes:**
The protected app navbar is an explicit `variant="app"` on the shared `Navbar`, with active route color and underline only on app pages. The profile page keeps the centered 980px layout and white card stack from `context/designs/profile.png`; `ProfileWorkspace` is the client bridge between resume extraction and the form, while `ProfileInformationForm` owns controlled field state. The resume selector is visually in the resume card but associated to the profile form through the HTML `form` attribute. The Extract from Resume and Generate Resume from Profile buttons use the same primary button pattern, show loading text in place, and share token-colored success/error feedback inside the resume card. Generated resume success updates the current resume link and refreshes the server-loaded profile data.

### Find Jobs Page Full UI

File: app/find-jobs/page.tsx, components/find-jobs/*
Last updated: 2026-06-21

| Property         | Class                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------- |
| Background       | Page `bg-background`; search/filter/table cards `bg-surface`; table header and logo wells `bg-surface-secondary`; success banner `bg-success-lightest` |
| Border           | Cards/table/filter controls `border border-border`; row separators `border-b border-border`; success banner `border border-success-light`; pagination `border-t border-border` |
| Border radius    | Cards `rounded-xl`; inputs/buttons/banners/logo wells `rounded-md`; score tracks `rounded-full` |
| Text - primary   | Company names and active pagination `text-sm font-semibold leading-5 text-text-primary`; primary button `text-base font-semibold leading-6 text-accent-foreground` |
| Text - secondary | Labels/headers `text-xs` or `text-sm font-semibold uppercase text-text-secondary`; placeholders `placeholder:text-text-muted`; dates and helper copy `text-text-secondary` |
| Spacing          | Page wrapper `max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 gap-6`; cards `p-6`; filter bar `px-5 py-3`; table cells `px-8/px-12 py-5`; pagination `px-6 py-4` |
| Hover state      | Primary button `hover:bg-accent-dark`; filter/pagination controls and table rows `hover:bg-surface-secondary`; focus `focus-visible:outline-accent` |
| Shadow           | Cards, controls, pagination buttons, and logo wells `shadow-card`; inputs `shadow-sm` |
| Accent usage     | Active nav and current page `text-accent`; primary Find Jobs button `bg-accent`; active page background `bg-accent-muted`; score fills use `bg-success`, `bg-info-medium`, and `bg-warning` |

**Pattern notes:**
Find Jobs keeps the full 1440px app canvas from the supplied reference image. Feature 09 is mock UI only: form inputs, filter dropdowns, score sorting, and pagination controls are visual placeholders until later features. The visible table follows `context/designs/find-jobs.png` with Company, Role, Match Score, Salary Est., and Date Found columns; the broader Source badge requirement is deferred because it is not present in the reference screenshot. Match bars use fixed mock width utilities and token fill classes instead of inline styles or raw color utilities.
