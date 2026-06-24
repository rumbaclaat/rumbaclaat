---
name: rumbaclaat-admin-design
description: Use whenever building or editing ANY Rumbaclaat ADMIN UI (anything under /admin) — a list, detail page, form, settings tab, or a brand-new module. Enforces the admin design system (dark+gold `.admin-*` classes, AG Grid lists, the reusable UI component library, the server-action + RBAC conventions). The rule is REUSE the existing components and patterns — never hand-roll a table or form, never introduce blue or Tailwind.
---

# Rumbaclaat admin design system

The admin is a **dark + gold, full-width, Bootstrap 5 / react-bootstrap** back-office. It shares the brand tokens in `src/styles/theme.css` (the `.admin-*` section) with the storefront but has its own component layer. **Reproduce the established patterns — do not invent new layouts, colours, or one-off tables/forms.**

## Non-negotiable rules
1. **Reuse the component library** (below). A new screen should be assembled from `PageHeader`, `AdminCard`, `AdminGrid`/`EntityGrid`, `FormSection`, `Field`, `ImageField`, `SaveBar`, `StatusBadge`, `AdminTabs`. Do **not** write a raw `<table>` for a list or a bare `<form>` grid for an editor.
2. **Every list is AG Grid** with a **top-right "+ New" button** in the `PageHeader` action. Never put an "add" form at the bottom of a list.
3. **Every image field uses `ImageField`/`GalleryField`** (upload-with-progress + media-library picker). Never a raw "paste URL" `<input>`.
4. **No blue, ever.** Focus rings, carets, calendar icons, links → gold (already themed). Don't add Bootstrap's primary blue.
5. **No Tailwind, no new design language.** Bootstrap 5 grid/utilities + the `.admin-*` classes + the tokens only.
6. **Every mutation goes through a server action** that calls `requirePermission(key)` + `logAudit()` and ends with `revalidatePath` + (`redirect` for create/update).
7. **Full width.** `.admin-content` has no max-width; lay screens out edge-to-edge.

## Tokens (from `theme.css :root`)
Surfaces `--bg` / `--bg-card2` / `--bg-card3`; gold `--gold` `#C6A75E`, `--gold-hi` `#E4C77B`, `--gold-md`, `--gold-lt`, `--gold-bdr`; text `--text` / `--text-muted` / `--text-dim`; status `--green` `--yellow` `--red`; `--serif` (Cormorant Garamond) for headings/numbers, `--sans` (Inter) for body; `--radius*`. Never introduce a raw hex outside this set.

## Component library (reuse these — file paths)
**Layout & chrome**
- `src/components/admin/admin-shell.tsx` — sidebar (grouped, icon nav) + offcanvas (mobile) + topbar (search + user `Dropdown`). New routes are added to its `NAV` array with a bootstrap-icon + `group`.
- `ui/page-header.tsx` — `PageHeader{title, subtitle?, breadcrumb?, action?}`. The `action` slot is where the **"+ New"** `<Link className="btn btn-gold btn-sm">` goes.
- `ui/breadcrumbs.tsx`, `ui/admin-card.tsx` (`AdminCard{title?, actions?}`), `ui/tabs.tsx` (`AdminTabs` for detail pages).

**Lists (AG Grid)**
- `grid/admin-grid.tsx` — generic `AdminGrid<T>` wrapper: quick-search, column sort/filter/menus, pagination + page-size, **CSV export**, **bulk-select + bulk action bar** (`bulkActions`), optional **row-drag reorder** (`onReorder`). Dark+gold theme from `grid/ag-theme.ts`.
- `grid/cells.tsx` — `ThumbCell`, `LinkCell`, `StatusCell`, `MoneyCell`, `DateCell`, `RowActionsCell` (inline edit/view/delete icons).
- `grid/entity-grid.tsx` — config-driven `EntityGrid` for simple CRUD lists (pass `rows`, `columns`, `nameField`, `editBase`, `deleteAction`, `reorderAction`). Use this for most lists; write a dedicated `*-grid.tsx` only when you need custom cells or bulk actions (see `products/products-grid.tsx`, `reviews/reviews-grid.tsx`).
- **Pattern:** the **server page** fetches via Prisma and maps to **plain serialisable rows** (numbers/strings, Dates → ISO), then renders a **client** `*-grid.tsx`. Decimals → `Number()`, never pass Prisma objects straight to the grid.

**Forms**
- `ui/form-section.tsx` (`FormSection{title, description?}` → a card with a `.row g-3`), `ui/field.tsx` (`Field`, `TextField`, `SelectField`, `TextareaField`, `CheckField` — labelled, `col-*`), `ui/save-bar.tsx` (sticky gold `SaveBar{submitLabel, cancelHref}`).
- `media/image-field.tsx` (`ImageField`), `media/gallery-field.tsx` (`GalleryField`), `media/media-picker-modal.tsx`. Image fields write the URL into a hidden `<input name={name}>` so the server action is unchanged.
- `dnd/sortable-list.tsx` (`SortableList`) + `src/lib/reorder.ts` `persistOrder(ids, updateOne)` for drag-reorder editors (variants, nav items).
- Keep **every `name=` attribute** matching what the server action reads.

**Status, charts, print**
- `ui/status-badge.tsx` (`StatusBadge{status}` → maps to gold/green/amber/red pill — never colour-only, always has text).
- `analytics/charts.tsx` (`BarChart`, `Donut` — dependency-free CSS/SVG).
- `ui/print-button.tsx` + `.print-sheet` for printable docs (packing slip / invoice).

## Screen patterns
- **List page** = server component → `PageHeader` (with "+ New" action) → grid. Example: `src/app/admin/(panel)/products/page.tsx`.
- **Create / Edit** = `new/page.tsx` + `[id]/page.tsx` that both render a shared `*-form.tsx` (sectioned `FormSection` cards → `Field`/`ImageField` → `SaveBar`). For typed records that differ by kind, branch the form (see `product-attributes.tsx` swapping rum vs clothing fields).
- **Detail / management** = `PageHeader` + KPI `.admin-stat` row + `AdminTabs` of `AdminCard` sections (see `customers/[id]`, `trade/[id]`, `orders/[id]`).
- **Reorder** = AG Grid `onReorder` (row drag) or `SortableList`, persisted via `persistOrder`.

## Server-action convention (`actions.ts`)
```ts
"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission, logAudit } from "@/lib/guard";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// str/num/optNum/int/date helpers (copy from an existing actions.ts)
export async function createThing(fd: FormData) {
  const s = await requirePermission("catalog.manage");      // a key from lib/permissions.ts
  const data = readThing(fd);
  const row = await prisma.thing.create({ data });
  await logAudit({ session: s, action: "thing.create", entityType: "Thing", entityId: row.id });
  revalidatePath("/admin/things");
  redirect("/admin/things");
}
// deleteThing, reorderThings(ids), bulkX(ids, …) follow the same shape.
```

## RBAC, money, dates
- Permissions: `src/lib/permissions.ts` (key catalogue + `ROLE_DEFAULTS` + `resolvePermissions` + `can`), enforced via `src/lib/guard.ts` `requirePermission(key)`. Pick the closest existing key; add one to the catalogue if genuinely new.
- Money: `formatMoney(value, currency)` from `src/lib/money.ts`. Dates: `DateCell` in grids, `toLocaleDateString("en-GB", …)` in tables.
- Email (replies/lifecycle): `src/lib/email.ts` `sendEmail()` (key-aware — logs the message and degrades gracefully without `RESEND_API_KEY`).

## When unsure
Open the closest existing module and copy its structure — e.g. a simple CRUD list → `collections/`, a tabbed detail → `customers/[id]`, a moderation grid → `reviews/`, a 2-level editor → `navigation/`. Match it; don't reinvent.
