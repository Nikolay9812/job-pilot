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
The homepage mirrors `context/designs/landing-page.png` as a centered 1440px landing canvas. Product visuals come from `public/logo.png`, `public/images/dashboard-demo.png`, `public/images/jobs-lists.png`, `public/images/agnet-log.png`, and `public/images/user-icon.png`. Landing sections should keep white card shells, token-colored borders/text, striped `landing-divider` gaps, and asset-led product previews.

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
