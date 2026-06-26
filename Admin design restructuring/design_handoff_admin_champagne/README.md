# Handoff: Rumbaclaat Admin — Champagne restyle

A package for restyling and reorganising the **entire admin area** to the new
“Champagne” design — applied from a single Claude Code prompt — **without**
changing AG Grid table functionality.

## Use it in 3 steps
1. Drop this `design_handoff_admin_champagne/` folder into your repo (or keep it open beside it).
2. Open the repo in Claude Code (VS Code).
3. Paste the contents of **`CLAUDE_CODE_PROMPT.md`** as your prompt. It tells Claude Code exactly what to do, in what order, and what *not* to touch.

## What’s in here
| File | What it is |
|---|---|
| **`CLAUDE_CODE_PROMPT.md`** | The paste-ready prompt. Start here. |
| **`champagne-design-system.md`** | Source of truth: tokens, type, components, the **rules**, and per-page layouts. |
| **`champagne-theme.css`** | Champagne tokens + `.admin-*` component layer. Near drop-in over your current `theme.css` component styles (variable names unchanged). |
| **`aggrid-champagne.css`** | AG Grid recolour — **styling only** (CSS variables / Theming-API params). |
| **`Rumbaclaat Admin.dc.html`** | The visual target — open in a browser to see all four screens, the hierarchy, and the live palette toggle. |
| `support.js` | Runtime needed to open the prototype locally; keep it next to the HTML. |

## Fidelity
**High-fidelity.** Final colours, typography, spacing, components, and layout are all specified. Recreate them in your existing React/Next.js components using your established patterns — the HTML files are **design references**, not code to ship.

## The one hard rule
**Do not change AG Grid behaviour** — columnDefs, data, sorting, filtering, selection, pagination, cell renderers, gridOptions all stay. This refresh only recolours the grid and reorganises the page *around* it. Everything else (routing, data fetching, server actions, form wiring) is likewise untouched — this is presentation only.

## The new rules (set in the Product area, applied everywhere)
One hierarchy per page · tier dense KPIs (primary tier + secondary strip) · tabs show one section at a time · edit screens = tabbed main + persistent Publish/Organisation rail + sticky save bar · one gold primary action per header · bulk bar only when rows are selected · even gap-based rows · restrained charts · identical shell + header on every page. Full detail in `champagne-design-system.md`.

## Pages covered
The four designed screens (Dashboard, Analytics, Product editor, Products list) are the templates; the prompt then applies the matching pattern (list / detail / overview) to every remaining admin page — Collections, Categories, Inventory, Reviews, Orders, Customers, Trade, Enquiries, Promotions, Banners, Gift cards, Newsletter, Pages, Blog, Cocktails, Staff, Appearance, Settings.
