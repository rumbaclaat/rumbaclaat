---
name: rumbaclaat-design
description: Use whenever building or editing ANY Rumbaclaat storefront UI — a page, section, component, or style. Enforces the exact Rumbaclaat design system reconstructed from /static-source (fixed tokens, fonts, component classes). The rule is reproduce the static-source markup verbatim; never invent colours, spacing, fonts, or layout.
---

# Rumbaclaat design system

The canonical visual reference is the **`static-source/` folder** (40 hand-built HTML pages) and the consolidated **`src/styles/theme.css`**. Treat both as ground truth. **Do not design, guess, or "improve" — reproduce.**

> Note: the original `static-source/assets/css/theme.css`, `assets/js/main.js` and `assets/img/*` were referenced but never included in the folder. `src/styles/theme.css` is the faithful reconstruction (tokens from the exact literal values used in the markup; component CSS copied verbatim from the inline `<style>` blocks). The brand logo/crest/partner images are missing and must be supplied by the client; until then use the styled `.brand-wordmark` text.

## The non-negotiable rules

1. **Find the source first.** Before building any page/section, open the matching file in `static-source/` (e.g. a product page → `static-source/product-rum.html`). Copy its **markup structure, class names, inline `style="…"` values, copy text, and image URLs verbatim** into the React/Bootstrap component.
2. **Use the design tokens — never raw colours.** All colour/spacing comes from the CSS variables below. Never introduce a hex/rgb value that isn't already in the token set or the source markup.
3. **Use the existing component classes** (`.btn-gold`, `.product-card`, `.hero-carousel`/`.hc-*`, `.eyebrow`, `.section`, `.card-brand`, `.tier-strip-card`, `.trust-bar`, `.site-footer`, `.accordion-button`, `.qty-btn`, `.swatch`, `.ck-*`, `.trade-table`, `.step-circle`, …). They already exist in `theme.css`. Do **not** invent new class names or restyle existing ones unless the source defines a new one — then copy it verbatim into the VERBATIM section of `theme.css`.
4. **Keep the same Unsplash image URLs** the source uses (they are in the markup) so pages look identical until real assets are supplied.
5. **Bootstrap 5 grid + utilities only.** The source is built on Bootstrap 5.3 (`container`, `row`, `col-*`, `d-flex`, `g-*`, etc.). Match its grid usage exactly.
6. **No Tailwind. No new design language.** If something isn't in the source or `theme.css`, ask — don't improvise.

## Tokens (from `src/styles/theme.css` `:root`)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0E0E0E` | page background |
| `--bg-card` / `--bg-card2` / `--bg-card3` | `#14110B` / `#1C1A14` / `#161310` | card/surface layers |
| `--gold` | `#C6A75E` | brand gold (buttons, accents) |
| `--gold-hi` | `#E4C77B` | brighter gold for text/links (AA on dark) |
| `--gold-md` | `rgba(198,167,94,.45)` | gold borders (emphasis) |
| `--gold-lt` | `rgba(198,167,94,.12)` | gold tint fills |
| `--gold-bdr` | `rgba(198,167,94,.18)` | hairline borders |
| `--bronze` / `--silver` | `#CD7F32` / `#C0C0C0` | tier accents |
| `--text` / `--text-muted` / `--text-dim` | `#F5F0E8` / `#CFC7B6` / `#9A927F` | text hierarchy |
| `--green` / `--yellow` / `--red` | `#4ADE80` / `#FBBF24` / `#F26D6D` | status |
| `--serif` | Cormorant Garamond | headings, prices, `.serif` |
| `--sans` | Inter | body |
| `--radius` / `--radius-lg` / `--radius-xl` | `10px` / `14px` / `18px` | corners |

## Type
- Headings, prices, eyebrow numerals → `--serif` (Cormorant Garamond, weight 500–700).
- Body, nav, labels → `--sans` (Inter). Loaded via `next/font` in `src/app/layout.tsx`.
- `.eyebrow` = uppercase, `.22em` letter-spacing, `--gold-hi`.

## Page → source-file map
| Build target | Source file |
|---|---|
| Home | `static-source/index.html` |
| Header / footer (identical site-wide) | top/bottom of any page, e.g. `index.html` |
| Shop / category | `shop.html`, `shop-rum.html`, `shop-men.html`, `shop-women.html` |
| Product detail | `product-rum.html` (rum), `product-apparel.html` / `product-tee.html` (apparel) |
| Cart / checkout / order | `cart.html` / `checkout.html` / `order.html` |
| Membership / signup / account | `join.html` / `signup.html` / `account.html` / `membership.html` |
| Trade | `trade.html`, `trade-apply.html` |
| Cocktails | `cocktails.html`, `cocktail-*.html` |
| Blog | `blog.html`, `blog-post.html` |
| Content / legal | `about.html`, `contact.html`, `faq.html`, `delivery.html`, `privacy.html`, `terms.html`, `cookies.html` |
| 404 / search | `404.html` / `search.html` |

## Workflow for any UI task
1. Open the matching `static-source/*.html`. Read the full `<main>` and its inline `<style>`.
2. Reproduce the markup as a React component: same elements, same classes, same inline styles, same copy, same image URLs. Swap hardcoded data for props/DB fields only where the data is dynamic — **keep the presentation identical**.
3. If the source's inline `<style>` defines a class not yet in `theme.css`, copy it **verbatim** into the VERBATIM section of `src/styles/theme.css`.
4. Verify against the source visually; the result must be indistinguishable in layout, colour, and type.

When in doubt, the answer is in `static-source/`. Reproduce it — do not deviate.

## The design pipeline (use for every page — new or rebuilt)

Every storefront page goes through this gate before it's "done":

1. **Scope** — identify the page and open its `static-source/*.html` (page→source map above). Read the full `<main>` + inline `<style>`.
2. **Design** — reproduce it (yourself, or via the `rumbaclaat-designer` agent): same structure, classes, inline styles, copy, image URLs. Wire dynamic data via props/DB only where the data is genuinely dynamic.
3. **Review (gate)** — run the `rumbaclaat-design-reviewer` agent on the result. It compares the build against the source and returns PASS/FAIL + DEVIATIONS + NEEDS CLARIFICATION. **A page is not done until it PASSES.**
4. **Ask, don't guess** — anything under NEEDS CLARIFICATION (e.g. a class whose CSS lived only in the absent `theme.css`, or a missing brand image) goes back to the human. Never invent the missing styling.
5. **Test design** — deploy the page to the live Vercel preview and share the URL so the human can eyeball it before it's accepted.

### Known unrecoverable gaps (always NEEDS CLARIFICATION, never guess)
The source folder was HTML-only. These were referenced but absent, so they cannot be reproduced verbatim and must be supplied/confirmed by the client:
- `assets/css/theme.css` core classes — reconstructed in `src/styles/theme.css`; a few page-specific classes (e.g. `.gift-card-banner*`, `.gift-card-mock*`) had **no** source CSS at all and are marked `RECONSTRUCTED — NEEDS CLIENT CONFIRMATION` in `theme.css`.
- `assets/js/main.js` — interactive behaviour (cart, carousels, filters) reimplemented in React, not copied.
- `assets/img/*` — the brand wordmark logo, crest, and partner logos (Drinkaware, accreditation). Until supplied, use the `.brand-wordmark` text and text labels.
