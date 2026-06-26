# Claude Code prompt — Restyle & reorganise the Rumbaclaat admin to the Champagne system

> Paste everything below the line into Claude Code, with this `design_handoff_admin_champagne/`
> folder available in the repo (or drag the folder in). Adjust the file paths in
> step 1 to match your project if they differ.

---

You are updating the **Rumbaclaat admin area** (Next.js + React, lists rendered with AG Grid). I’m giving you a finished visual target and a design system. Your job is to **restyle and reorganise every admin page** to match it — a visual/layout refresh, **not** a behaviour change.

## Reference material (in `design_handoff_admin_champagne/`)
- `Rumbaclaat Admin.dc.html` — the **visual target**. Open/read it to see the intended look, hierarchy, and every screen (Dashboard, Analytics, Product editor, Products list). It’s an HTML prototype — a reference, not code to copy verbatim.
- `champagne-design-system.md` — tokens, type, components, the **rules**, and per-page layout. Read this first.
- `champagne-theme.css` — the champagne tokens + `.admin-*` component layer. Near drop-in for the current `theme.css` component styles.
- `aggrid-champagne.css` — AG Grid recolour (variables/theme params only).

## Hard constraints — do NOT cross these
1. **Do not change AG Grid functionality.** Leave `columnDefs`, `rowData`/row models, sorting, filtering, selection, pagination, cell renderers, value getters/formatters, and every `gridOptions` exactly as they are. You may only **recolour** the grid (via `aggrid-champagne.css` / theme params) and, where a list page’s surrounding chrome needs it, restyle the toolbar/header/bulk-bar/pager **around** the grid.
2. **Don’t touch data, routing, server actions, or business logic.** No changes to data fetching, mutations, auth, or API calls. This is presentation only.
3. **Preserve all existing behaviour and props.** Same routes, same component contracts, same form submissions. If a refactor is tempting, don’t — keep diffs focused on markup/styles/layout.
4. **Keep accessibility intact or better:** labels, focus states (the gold focus ring), keyboard order, hit targets ≥ 44px.

## Step 1 — Adopt the design system (tokens + components)
- Replace the current admin token block in `theme.css` (or wherever the `--bg / --gold / --text …` variables live) with the `:root` block from `champagne-theme.css`. Variable **names are unchanged**, so existing classes pick up the new palette automatically.
- Reconcile the `.admin-*` component layer with `champagne-theme.css`. Adopt the refinements marked `REFINED` / `NEW`:
  - active sidebar link inset gold bar,
  - `.admin-section-label` KPI tier headings,
  - `.admin-stat--hero` / `--primary` variants,
  - the new `.admin-chart` → `.admin-bars` + `.admin-bar-axis` chart structure,
  - `.admin-rank` ranked horizontal bars,
  - `.admin-product-grid` / `-main` / `-rail`,
  - badges with the leading dot.
- Wire `aggrid-champagne.css` per the version note at the top of that file (CSS variables for legacy themes; `themeQuartz.withParams({...})` for the Theming API).

## Step 2 — Reorganise each page (layout/JSX)
Follow the per-page layouts in `champagne-design-system.md` §4. Summary of the **rules** to apply everywhere (§2 of that doc):
1. One clear hierarchy per page — lead with the single most important element; secondary content is smaller/lighter.
2. Tier dense KPI sets into a **primary tier + secondary strip** under uppercase section labels — never a flat grid of equal cards.
3. **Tabs render only the active section** (never all sections stacked).
4. Edit screens = tabbed **main column + persistent Publish/Organisation rail** + sticky save bar.
5. Exactly **one** solid gold primary action per header/toolbar; the rest outline/ghost.
6. The **bulk-action bar appears only when ≥1 row is selected** (drive it off the grid’s existing selection API — read selection, don’t change how it works).
7. Even, gap-based flex/grid rows that fill width (no ragged `auto-fill`).
8. Restrained charts: total in the card-head badge, bars in a fixed-height plot + separate label row, ranked horizontal bars for long-labelled series.
9. Identical shell + header pattern (breadcrumb → H1 + subtitle → actions) on every page.

Do the four designed pages first (Dashboard, Analytics, Product editor, Products list) to match the prototype, then apply the matching pattern to the remaining admin pages:
- **List pages** (Collections, Categories, Inventory, Reviews, Orders, Customers, Trade, Enquiries, Gift cards, Newsletter, Staff, …): header → toolbar → [bulk bar] → AG Grid (recoloured) → pager.
- **Detail/edit pages**: header → [functional tabs] → main + Publish/Organisation-style rail → save bar.
- **Overview pages** (any other dashboards): hero/primary tier → charts → tables.

## Step 3 — Product editor specifics
The current product page shows every section at once under decorative tabs — fix this:
- Make the tabs **stateful** (`const [tab, setTab] = useState('general')`) and render only the active section.
- Move organisation fields (type, category, collections, tags, featured/member flags) and publish controls (status, launch date, Save) into a **persistent right rail** that shows on all tabs.
- Keep the existing form state, field names, and submit/server-action wiring exactly as-is — only the layout and which fields live where changes.

## Working approach
- Read `champagne-design-system.md` and skim `Rumbaclaat Admin.dc.html` before editing.
- Work **one page at a time**. After each page: confirm the build compiles, the page renders, and AG Grid still sorts/filters/selects/paginates as before. Show me a brief diff summary per page.
- Reuse existing components and the `.admin-*` classes; don’t invent parallel ones.
- If something in the prototype conflicts with an existing behaviour or accessibility, keep the behaviour and tell me.

## Done when
- Every admin page uses the champagne palette and the shared shell/header pattern.
- Each page’s hierarchy and layout follow the rules above and the prototype.
- The product editor’s tabs work (one section at a time) with a persistent publish/organisation rail.
- **All AG Grid behaviour is byte-for-byte unchanged** — only its colours differ.
