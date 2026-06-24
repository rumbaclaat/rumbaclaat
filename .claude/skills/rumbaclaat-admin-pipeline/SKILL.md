---
name: rumbaclaat-admin-pipeline
description: The step-by-step pipeline for adding or changing a Rumbaclaat ADMIN section (a new list/detail/form module, or a field on an existing one) so it stays consistent, secure, and verified. Run every new admin module through these gates before it's "done". Pairs with the `rumbaclaat-admin-design` skill (which components/patterns to use) and — for any storefront work the change touches — the `rumbaclaat-design`, `accessibility`, and `responsive-design` skills.
---

# Rumbaclaat admin build pipeline

Use this whenever you add a new admin module or extend an existing one. It is the **process**; `rumbaclaat-admin-design` is the **palette**. A change is not done until every gate passes.

## The pipeline
**scope → schema → actions → list → form → detail → nav → verify → commit**

### 1. Scope
- Name the entity and the **permission key** it needs (reuse one from `src/lib/permissions.ts`; add a key only if genuinely new).
- Find the closest existing module to copy (simple CRUD → `collections/`; tabbed detail/CRM → `customers/[id]`; moderation grid → `reviews/`; 2-level editor → `navigation/`; classes → `tax-classes/`).
- If it's storefront-facing too, note that it will also run the storefront gates (§ Extending to the front end).

### 2. Schema (only if new data)
- Add the Prisma model/fields to `prisma/schema.prisma`. Keep new fields **optional or defaulted** so `prisma db push` is non-destructive.
- `npx prisma db push` then `npx prisma generate`. Update `prisma/seed-demo.ts` if the screen needs sample data.

### 3. Server actions — `src/app/admin/(panel)/<entity>/actions.ts`
- `"use server"`; `str/num/optNum/int/date` helpers (copy from an existing actions file).
- `requirePermission(key)` + `logAudit()` in every mutation; end with `revalidatePath(...)` and `redirect(...)` (create/update). Provide `delete`, `reorder(ids)` (via `persistOrder`), and `bulkX(ids, …)` as needed.

### 4. List page — `<entity>/page.tsx`
- Server component: fetch via Prisma → map to **plain rows** (Decimals→`Number`, Dates→ISO).
- `PageHeader` with a **top "+ New"** `<Link className="btn btn-gold btn-sm">` in `action`.
- Render `EntityGrid` (config-driven) or a dedicated client `*-grid.tsx` (needs custom cells / bulk actions / row-drag). **No bottom add-forms.**

### 5. Create / Edit — `<entity>/new/page.tsx` + `<entity>/[id]/page.tsx`
- Both render a shared `src/components/admin/<entity>/<entity>-form.tsx`: `FormSection` cards → `TextField`/`SelectField`/`CheckField`/`ImageField`/`GalleryField` → `SaveBar`.
- Every image field is `ImageField`/`GalleryField`. Every `name=` matches what the action reads. Drag-reorder editors use `SortableList`.

### 6. Detail subpage (if it manages related data)
- `PageHeader` + optional KPI `.admin-stat` row + `AdminTabs` of `AdminCard` sections (orders/points/addresses/messages/etc.). Reply/contact → `sendEmail` + log a thread row.

### 7. Navigation
- Add the route to the `NAV` array in `src/components/admin/admin-shell.tsx` with a `bi-*` icon and the correct `group` (Catalogue / Content / Loyalty / Marketing / Store / Site / Access).

### 8. Verify (the gate — all must pass)
- `npx tsc --noEmit` clean (stop the dev server + clear `.next` first if you see stale `.next/dev/types/routes.d.ts` errors — they're generated, not real).
- `npm run lint` adds no new errors.
- `npm run dev` → walk the list (sort/filter/search/paginate/CSV/bulk/row-drag), create, edit, delete, and any detail/reply flow. Migrations applied + demo data shows.
- `npm run a11y` → 0 Critical/Serious (labels, one `<h1>` per page from `PageHeader`, gold-on-dark contrast, modal/dropdown focus). Responsive at 320/375/768/1024/1440 (offcanvas works, grids scroll, forms single-column).

### 9. Commit
- One focused commit (`git add -A`, descriptive message, `Co-Authored-By` line). Push only when asked.

## New-module recipe (8 files)
```
prisma/schema.prisma                                   # model (step 2)
src/app/admin/(panel)/<entity>/actions.ts              # CRUD + guard + audit
src/app/admin/(panel)/<entity>/page.tsx                # list (PageHeader + grid)
src/app/admin/(panel)/<entity>/new/page.tsx            # create
src/app/admin/(panel)/<entity>/[id]/page.tsx           # edit / detail
src/components/admin/<entity>/<entity>-form.tsx         # shared form (FormSection/Field/SaveBar)
src/components/admin/<entity>/<entity>-grid.tsx         # only if custom cells/bulk (else EntityGrid)
src/components/admin/admin-shell.tsx                    # NAV entry
```

## Hard rules (mirror of the design skill — fail the gate if violated)
- List → AG Grid + top "+ New". Form image → `ImageField`. Mutation → `requirePermission` + `logAudit`. No blue, no Tailwind, no hand-rolled tables/forms. Full-width.

## Extending to the front end
For storefront UI the change touches, swap the palette and gates:
- **Build** with `rumbaclaat-design` (reproduce `/static-source` + `theme.css` verbatim; the `rumbaclaat-designer` agent can do it).
- **Review** with the `rumbaclaat-design-reviewer` agent (PASS/FAIL fidelity gate).
- **Then** the same final gate as step 8: `tsc`/`lint` → `npm run a11y` (0 violations) → `responsive-design` checklist at all breakpoints.
The shape is identical — only the design source-of-truth (admin component library vs `/static-source`) and the review gate differ.
