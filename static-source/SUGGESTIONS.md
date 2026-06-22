# Rumbaclaat — "Could be better" suggestions

Prioritised improvements beyond the rebuild brief. Grouped by impact.

## High impact
1. **Host images locally & optimise.** The site pulls all imagery from Unsplash URLs. Download into `assets/img/`, serve responsive sizes (`srcset`/`sizes`), and use AVIF/WebP. This removes the third-party dependency, cuts the page weight well under the 1MB target, and means the site works offline.
2. **Add a real backend / no-JS fallback for commerce.** Cart, checkout, sign-in, membership upgrades and order placement are currently front-end simulations. Wire them to a real backend (and ensure forms degrade gracefully without JavaScript) before taking payments.
3. **Server-side age verification.** The age gate is a good front-end deterrent but is client-side only. For a real alcohol retailer, age should also be enforced server-side at checkout and validated by the courier on delivery (the UI already states this).
4. **Self-host Bootstrap & fonts.** Currently from CDN. Self-hosting (or at least adding SRI integrity hashes) improves privacy, resilience, and GDPR posture (Google Fonts via CDN can be a data-transfer concern in the EU/UK).

## Medium impact
5. **Consolidate inline styles into theme classes.** Many elements still use `style="..."` attributes carried over from the original. Moving these into named classes in `theme.css` would shrink the HTML, improve caching, and make future restyling far easier.
6. **Real cookie consent gating.** The banner records a choice but no analytics are loaded either way. If/when analytics are added, ensure they only fire after explicit consent, and add a "manage preferences" view.
7. **Persist auth/membership state across pages.** Account and membership are independent demos. A shared session (cookie/JWT) would let the nav reflect logged-in state and protect member-only pages.
8. **Form UX polish.** Add inline per-field validation messages (not just the summary), success states, and `aria-describedby` links between inputs and their hint/error text.
9. **Structured data & SEO.** Add `Product`, `Organization`, and `BreadcrumbList` JSON-LD; per-page Open Graph/Twitter cards; a `sitemap.xml` and `robots.txt`.

## Lower impact / polish
10. **Skeleton/loading states** for the cart and any async data, so there's no flash of empty content.
11. **Honour `prefers-color-scheme`** — the brand is dark by design, but offering a light theme (or at least testing forced-colors/Windows High Contrast mode) would widen reach.
12. **Micro-interactions audit.** The parallax uses `background-attachment: fixed`, which can be janky on some mobile browsers; consider a lighter transform-based effect (already disabled under reduced-motion).
13. **Add a 404 page** styled to match, with a route back into the shop.
14. **Automated testing in CI.** The checks run during this build (axe-core / Pa11y for a11y, Lighthouse for performance, a link checker) could be wired into a CI pipeline so regressions are caught automatically.
15. **Favicon & web app manifest** for a polished install/bookmark experience.

## Before launch (must-do)
- Manual screen-reader pass (NVDA + VoiceOver) and full keyboard-only walkthrough of every interactive flow.
- Real-device testing on at least one low-end Android and one iPhone.
- Legal review of the new privacy/terms/cookies copy by someone qualified — the provided text is sensible boilerplate, not legal advice.
