---
name: responsive-design
description: Use when building or editing ANY Rumbaclaat UI to guarantee it is mobile-first and responsive across all screen sizes. Defines the breakpoints, the per-component mobile behaviour, the touch-target/overflow rules, and the responsive gate that every page must pass before it ships. Pairs with the rumbaclaat-design and accessibility skills.
---

# Responsive design (mobile-first)

Rumbaclaat is **mobile-first** on **Bootstrap 5.3**. Base styles target the smallest phone; layout scales **up** with `col-*` / `*-md-*` / `*-lg-*` and `min-width` media queries. Never design desktop-down.

## Breakpoints (Bootstrap 5.3)
| Token | Min width | Typical device |
|---|---|---|
| `xs` (default) | 0 | phones (portrait) |
| `sm` | 576px | phones (landscape) |
| `md` | 768px | tablets |
| `lg` | 992px | small laptops |
| `xl` | 1200px | desktops |
| `xxl` | 1400px | large desktops |

**Always test at:** 320, 375, 414 (phones), 768 (tablet), 1024, 1280, 1440 (desktop). 320px is the hard floor — nothing may overflow there.

## Non-negotiable rules
1. **No horizontal scroll** at any width. `body` is `overflow-x: hidden`; never set fixed pixel widths wider than the viewport. Use `%`, `max-width`, `min-width: 0` on flex/grid children that hold long content.
2. **Fluid grid:** start `col-12` (full width on phone), then add `col-sm-*/col-md-*/col-lg-*`. Use `g-*` gutters. Example: `col-12 col-md-6 col-lg-4`.
3. **Tables → horizontal scroll:** wrap every wide table in `.table-responsive` (admin tables, trade pricing/orders, etc.). Never let a table set the page width.
4. **Touch targets ≥ 44×44px** (24px is the WCAG minimum — aim 44). Buttons, nav icons, qty steppers, dots' hit areas.
5. **Fluid type:** headings use `clamp()` (e.g. `clamp(2rem, 5vw, 4rem)`). Body ≥ 16px. No text clipping or truncation that hides content.
6. **Images responsive:** `max-width: 100%; height: auto` (global). Background images `cover`/`center`.
7. **Sticky nav offset:** fixed header is ~66px; `* { scroll-margin-top: 90px }` keeps anchored/focused content clear of it.
8. **Stack, don't squeeze:** multi-column layouts collapse to one column on phones (forms, `.ck-layout`, `.home-socials-inner`, two-col blocks all switch to `1fr` below their breakpoint).
9. **Respect `prefers-reduced-motion`** for parallax/animation (already in `theme.css`).

## Per-component mobile behaviour (the plan)
| Component | Phone (xs) | Tablet (md) | Desktop (lg+) |
|---|---|---|---|
| Header nav | hamburger collapse (react-bootstrap `expand="lg"`); cart/account icons stay visible | hamburger | full inline nav |
| Hero banner | logo ~80% (max 260px), text `clamp`, CTAs wrap | centred | centred, larger |
| Product / blog / cocktail grids | 1–2 per row (`col-6`/`col-12`) | 2 (`col-md-6`) | 3–4 (`col-lg-4/3`) |
| Membership tier cards | 2 per row (`col-6`) | 2 | 4 (`col-lg-3`) |
| Cocktail detail `.ck-layout` | 1 column (image then recipe) | — | 5fr/7fr two-column at >860px |
| Trade portal / admin tables | `.table-responsive` scroll | scroll/fit | full table |
| Checkout / forms | single column, full-width fields | 2-up where sensible | 8/4 split (form + summary) |
| Footer | columns stack (`col-6`) | partial | 5/2/2/3 columns |

## Responsive gate (run on every page, with the design + a11y gates)
**design (rumbaclaat-designer) → design-review → accessibility gate → RESPONSIVE gate → ship**

Checklist — a page is not done until all pass:
- [ ] **320px:** no horizontal scrollbar; nothing clipped or overlapping.
- [ ] Header collapses to a working hamburger; menu opens/closes.
- [ ] Every grid reflows to 1 (or 2) columns on phone.
- [ ] Wide tables scroll inside `.table-responsive`, not the page.
- [ ] Tap targets ≥ 44px; adjacent targets not touching.
- [ ] Body text ≥ 16px; headings scale with `clamp`; no truncation hiding content.
- [ ] Images/logos scale; no overflow.
- [ ] Sticky header never covers focused/anchored content.
- [ ] Re-check 375 / 768 / 1024 / 1440.

### How to test
- Browser devtools responsive mode at the widths above, **or** narrow the window to 320px.
- Quick overflow check in devtools console:
  `[...document.querySelectorAll('*')].filter(e=>e.scrollWidth>document.documentElement.clientWidth).map(e=>e.className)`
  → should be empty (or only intentionally-scrollable `.table-responsive`).
- The `rumbaclaat-design-reviewer` agent also audits the markup for responsive grid usage and fixed widths.

When a layout doesn't have an obvious mobile behaviour in the table above, **ask** — don't guess a breakpoint.
