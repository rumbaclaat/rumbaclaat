# Rumbaclaat — Bootstrap 5 Rebuild (complete site)

A full, accessible, mobile-first rebuild of the Rumbaclaat site on Bootstrap 5.

## How to run
Open `index.html` in any browser. **No build step, no server, no npm.**
Bootstrap 5.3 loads from CDN; all brand styling lives in `assets/css/theme.css`; all shared behaviour in `assets/js/main.js`. Product images load from Unsplash (an internet connection is needed to see them).

## Folder structure
```
rumbaclaat/
├── index.html                ← home (reference page)
├── shop.html  shop-rum.html  shop-men.html  shop-women.html  shop-drops.html
├── cart.html  checkout.html
├── cocktails.html  blog.html  about.html  contact.html
├── join.html  signup.html  membership.html  account.html  trade.html
├── privacy.html  terms.html  cookies.html      ← new (were linked but missing)
├── assets/
│   ├── css/theme.css         ← migrated design system + Bootstrap remap + a11y fixes
│   ├── js/main.js            ← shared accessible JS (no inline handlers)
│   └── img/                  ← local images (currently uses remote Unsplash URLs)
└── README.md
```

## What changed

**Framework & structure**
- Migrated to Bootstrap 5.3 (CDN). The brand is carried entirely by `theme.css` — it does not look like default Bootstrap.
- Original design tokens, fonts (Cormorant Garamond + Inter) and components preserved.
- One clean `assets/` structure. Nav and footer are identical across every page (single source of truth) and live in the HTML so they work without JavaScript.
- All layout rebuilt on the Bootstrap grid — reflows cleanly from 320px upward.

**Accessibility (WCAG 2.2 AA)**
- Semantic landmarks (`header`/`nav`/`main`/`footer`), exactly one `<h1>` per page, no skipped heading levels (verified on all 20 pages).
- Skip link, strong visible focus indicators (SC 2.4.7), `scroll-margin` so the fixed nav never hides focused/anchored content (SC 2.4.11).
- **Contrast fixed**: the original muted grey, dim text and red were below 4.5:1 on the dark background. All text now meets AA (verified by calculation). A brighter gold (`--gold-hi`) is used for text/links.
- Tabs → Bootstrap pill tablists (`role="tablist/tab/tabpanel"`); modals → Bootstrap modals (built-in focus trapping + Esc); accordions → Bootstrap accordion; size/option selectors → real radio groups in `<fieldset>`.
- All forms have associated `<label>`s, `autocomplete` attributes, inline error summaries (`role="alert"`, focus moved to them) and `aria-invalid`.
- Cart/quantity changes, redemptions and step changes announce via a polite live region.
- Images carry descriptive alt text and lazy-load. `prefers-reduced-motion` is honoured.

**Alcohol-compliance (regulated product)**
- Age gate rebuilt as an accessible, focus-trapped dialog asking for **date of birth with real validation** (not a one-click "yes"). Under-18s are redirected to Drinkaware.
- 18+ / responsibility messaging in the footer of every page; checkout and account state that age is verified on delivery.
- Cookie banner has a genuine "reject non-essential" option.
- New `privacy.html`, `terms.html`, `cookies.html` with UK-appropriate (UK GDPR / Consumer Contracts) content — these were linked from the footer and age gate but absent from the original.

**JavaScript**
- Zero inline event handlers across the whole site (the original had 144). Everything is delegated `data-action`/listeners.
- `main.js` is a single IIFE exposing `window.RC.Cart`; page-specific logic is in small per-page scripts. All scripts `defer`.

## Known limitations / honest notes
- Payments, sign-in, and order placement are **simulated** (front-end only) — same as the original. No backend.
- Product imagery uses remote Unsplash URLs; for production, download into `assets/img/` and update `src`s so the site is self-contained and faster.
- Automated checks (structure, headings, contrast maths, JS validity, link graph) all pass, but a **manual screen-reader and keyboard pass on real devices** should still be done before launch — that can't be automated in this environment.

## "Could be better" — prioritised suggestions
See the separate suggestions list provided with the delivery.
