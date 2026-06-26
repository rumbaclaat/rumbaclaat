# Rumbaclaat Admin — Champagne Design System

The reference implementation of every rule below is the prototype
`Rumbaclaat Admin.dc.html` (open it in a browser). This document is the
written source of truth; `champagne-theme.css` is the CSS implementation.

---

## 1. Design tokens

### Colour
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0E0E12` | Page background (darkest) |
| `--bg-card` | `#16161B` | Mid surface / subtle panels |
| `--bg-card2` | `#1A1A20` | **Cards & raised surfaces** (lightest) |
| `--bg-card3` | `#141419` | Sidebar, inputs, table headers (recessed) |
| `--gold` | `#CDB582` | Primary accent (champagne) |
| `--gold-hi` | `#E6D2A0` | Highlight / hover / active text |
| `--gold-lt` | `rgba(205,181,130,0.12)` | Tint fills (active nav, badges, bulk bar) |
| `--gold-bdr` | `rgba(205,181,130,0.16)` | Accent borders |
| `--line` | `rgba(205,181,130,0.14)` | Hairline dividers & card borders |
| `--text` | `#F3EFE6` | Primary text |
| `--text-muted` | `#C7C1B2` | Secondary text, labels |
| `--text-dim` | `#8C8678` | Tertiary text, captions, axis labels |
| `--on-gold` | `#171310` | Text/icon on a solid gold button |
| `--green` | `#6FCF97` | Success / positive delta |
| `--red` | `#EC8B8B` | Danger / negative delta |
| `--yellow` | `#E8B65A` | Warning |

Old → new accent: brass `#C6A75E` → champagne `#CDB582`; warm brown-blacks → cooler charcoal. Keep accent usage restrained — gold is for emphasis (primary action, active state, key numbers, focus), not for filling areas.

### Typography
- **Serif — Cormorant Garamond** (500/600/700): all headings, big metric numbers, card titles. Gives the premium-spirits character.
- **Sans — Inter** (400/500/600/700): all UI, body, labels, tables, inputs.

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Page H1 | Serif | `clamp(1.7rem, 3.4vw, 2.1rem)` | 600 | |
| Card title (h3) | Serif | `1.2rem` | 600 | |
| Hero metric | Serif | `3rem` | — | colour `--gold-hi` |
| Primary metric | Serif | `2.5rem` | — | |
| Stat metric | Serif | `1.95rem` | — | |
| Section / KPI label | Sans | `.66–.72rem` | 500–600 | UPPERCASE, letter-spacing `.07–.15em`, `--text-dim` |
| Body / control | Sans | `.85–.9rem` | 400–500 | |
| Table header | Sans | `.68rem` | 600 | UPPERCASE, `.08em`, `--text-muted`, bg `--bg-card3` |

### Radius & metrics
Cards `14px` (hero/primary `16px`) · controls & buttons `9px` · pills/badges `999px` · icon buttons & thumbnails `8px` · sidebar `248px` · topbar `64px`.

### Numbers
All numeric/tabular data uses `font-variant-numeric: tabular-nums`; align numeric table columns right.

---

## 2. The rules (established in the Product area, applied everywhere)

These are the organising principles the redesign introduced. Apply them to **every** admin page.

1. **One hierarchy per page.** Each page leads with its single most important thing (a hero metric, the primary table, the form title). Secondary content is visibly smaller / lighter. Never a flat field of equal-weight cards.
2. **Tier dense metric sets.** When a page has many KPIs, split them into a *primary tier* (2–3 large cards) and a *secondary strip* (smaller cards), separated by an uppercase `--text-dim` section label (e.g. “Headline” / “Detail”). Don’t drop 7 equal cards into an auto-fill grid (it wraps raggedly).
3. **Tabs are real navigation.** If a screen shows tabs, only the active section’s content is in the DOM/visible. Never render every section stacked under decorative tabs.
4. **Editing screens = main + persistent rail.** A tabbed main column for the content being edited, plus a right rail (`Publish` + `Organisation`) that stays put on every tab. Sticky save bar at the bottom.
5. **One primary action.** Exactly one solid `--gold` button per header/toolbar (e.g. “New product”, “Save product”). Everything else is outline or ghost.
6. **Selection drives bulk UI.** The bulk-action bar exists only when ≥1 row is selected; it shows the count and a Clear affordance.
7. **Even, gap-based rows.** Lay out card rows with `flex`/`grid` + `gap` and `flex-grow` so they fill the width — no ragged `auto-fill` holes.
8. **Restrained charts.** Drop redundant per-bar numbers; surface the total in the card-head badge. Bars sit in a fixed-height plot with a separate aligned label row. Use a ranked horizontal bar list for long-labelled series (e.g. top products).
9. **Consistent shell + headers.** Identical sidebar, topbar, breadcrumb → H1 + subtitle → actions on every page.

---

## 3. Components

> Full CSS in `champagne-theme.css`. Classes keep the existing `.admin-*` names so this is a near drop-in over the current `theme.css` component layer.

- **Sidebar** `.admin-sidebar` — `248px`, `--bg-card3`, right hairline. Brand block = gradient gold monogram `.admin-brand-mark` + name + “Admin Console” tag. Grouped nav with uppercase `.admin-nav-group-label`s. `.admin-nav-link` 42px min-height; **active** = gold tint + `--gold-hi` text + `box-shadow: inset 2px 0 0 var(--gold)` left bar + hairline.
- **Topbar** `.admin-topbar` — `64px`, sticky, blurred `--bg-card3`, hairline bottom. Search left; right cluster = (optional theme swatches) · notifications · user.
- **Page header** `.admin-page-head` — `.admin-crumbs` breadcrumb → H1 + `.admin-page-sub` on the left, `.admin-page-actions` on the right. `.admin-section-label` for KPI tier headings.
- **Card** `.admin-card` — `--bg-card2`, hairline, `14px`, `20–22px` padding. `.admin-card-head` = serif title + optional badge/action.
- **Buttons** — `.btn-gold` (primary, `--on-gold` text), `.btn-outline-gold`, `.btn-ghost`.
- **Form controls** — `--bg-card3` bg, hairline, `9px`; focus = `--gold` border + `0 0 0 3px var(--gold-lt)` ring; `.form-label` `.8rem` `--text-muted`.
- **Status badge** `.admin-badge` + `--success|--warn|--danger|--info|--muted` — pill, leading dot in `currentColor`. Add `--no-dot` to suppress the dot.
- **Tabs** `.admin-tabs` / `.admin-tab(.active)` — pills; active = gold tint + `--gold` border. *Render only the active section.*
- **KPI cards** `.admin-stat` (+ `--hero`, `--primary`) `.admin-stat-row` — label + icon chip, big serif number, `.admin-stat-delta.up/.down`.
- **Charts** `.admin-chart` → `.admin-bars` (fixed-height plot, bars only) + `.admin-bar-axis` (label row). `.admin-rank` ranked horizontal bars. `.admin-donut` conic-gradient + radial hole + centre label + `.admin-legend`.
- **Tables (plain HTML)** `.admin-table` — uppercase header on `--bg-card3`, hairline rows, hover tint, `.td-num` right-aligned, `.admin-cellname` thumbnail + name/sku.  *(In the real app most lists are AG Grid — recolour via `aggrid-champagne.css`.)*
- **Toolbar / Bulk bar / Pager** `.admin-toolbar`, `.admin-bulkbar` (only when selected), `.admin-pager`.
- **Product layout** `.admin-product-grid` → `.admin-product-main` (tabbed) + `.admin-product-rail` (Publish + Organisation). `.admin-savebar` sticky bottom.
- **Timeline** `.order-timeline` · **Mini list** `.admin-mini-row` · **Media** `.admin-image-preview` + `.admin-gallery`.

---

## 4. Per-page organisation

### Dashboard
Header → **hero Revenue** (`--hero`, with sparkline) beside 4 secondary stats → revenue trend chart (wide) + Sales-by-category donut → Recent orders table (wide) + right rail (**Low stock**, emphasised, + Recent activity timeline).

### Analytics
Header → **“Headline”** primary trio (Revenue / Orders / Customers, `--primary`) → **“Detail”** strip of 4 smaller stats (AOV, Members, Trade revenue, Trade outstanding — last one warn-bordered) → Revenue-by-month chart (full width) → Orders-by-month + Membership-tiers donut → Points donut + **Top products as ranked horizontal bars**.

### Product editor
Breadcrumb → title + status badge + actions (Duplicate, View on store) → **functional tabs** (General / Pricing & inventory / Attributes / Media / SEO) → `.admin-product-grid`: tabbed **main** (only active section) + persistent **rail** (Publish: status/launch/Save; Organisation: type/category/collections/tags/flags) → sticky save bar. General tab carries name/subtitle/slug/description; organisation/type/category live in the rail.

### Products list (and all list pages)
Header (Export + **New product** primary) → toolbar (search + filters + result count) → conditional bulk bar → **AG Grid** (recoloured only) → pager.

### Applying to the remaining pages
Collections, Categories, Inventory, Reviews, Orders, Customers, Trade, Enquiries, Promotions, Banners, Gift cards, Newsletter, Pages, Blog, Cocktails, Staff, Appearance, Settings:
- **List pages** → follow the *Products list* pattern (header → toolbar → [bulk bar] → AG Grid → pager).
- **Detail/edit pages** → follow the *Product editor* pattern (header → [tabs] → main + Publish/Organisation-style rail → save bar).
- **Overview pages** → follow the *Dashboard/Analytics* hierarchy (hero/primary tier → charts → tables).

---

## 5. Assets
- Icons: **Bootstrap Icons** (already in use).
- Fonts: **Cormorant Garamond** + **Inter** (Google Fonts, already loaded).
- Product imagery in the prototype is from Unsplash placeholders — replace with real catalogue media in the app.
