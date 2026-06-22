# Rumbaclaat — CMS Ecommerce Platform

Premium Caribbean rum + apparel ecommerce platform with a Bootstrap admin CMS.

**Live:** https://rumbaclaat.vercel.app · **Admin:** https://rumbaclaat.vercel.app/admin/login

## Stack
- **Next.js 16** (App Router, TypeScript) + **React 19**
- **Bootstrap 5** + react-bootstrap (storefront + admin)
- **Supabase** — Postgres database + Auth + (Storage, planned)
- **Prisma 7** (pg driver adapter)
- Deployed on **Vercel** (auto-deploys on push to `main`); source on GitHub `rumbaclaat/rumbaclaat`

## Local development
```bash
npm install          # also runs `prisma generate`
npm run dev          # http://localhost:3000
```
Requires `.env.local` (copy from `.env.example`) with Supabase URL/keys + `DATABASE_URL`/`DIRECT_URL`.

## Admin login
- URL: `/admin/login`
- Email: `admin@rumbaclaat.com`
- Password: `RumbaclaatAdmin!2026`  ← **change this after first login** (or re-run the seeder with `ADMIN_PASSWORD`).

## Database scripts
```bash
npm run db:push         # apply prisma/schema.prisma to Supabase (no migration files)
npm run db:seed         # seed base catalogue (tiers, categories, products, variants)
npm run db:seed-admin   # create/repair the super-admin user
npm run db:seed-pages   # seed the example /about page (built from blocks)
npm run db:studio       # open Prisma Studio
```

## What's built (Phase 0 + Phase 1)
- Storefront shell: header, footer, **age gate (DOB)**, cookie consent — dark + gold brand theme
- **Admin CMS** (`/admin`): dashboard, Settings, Categories, Products (+ variants), Pages (block editor), Blog, Cocktails
- **Content blocks**: schema-driven, add/reorder/show-hide/edit; rendered on the storefront
- **Storefront**: `/shop` (DB catalogue + filters), `/product/[slug]` (PDP), `/[slug]` (CMS pages), `/blog`, `/cocktails`
- Supabase Auth + RBAC (`StaffUser` roles); route protection via `proxy.ts`

## Roadmap (next phases)
See the build plan. Next up: media library (Supabase Storage) + WYSIWYG (TipTap), cart/checkout (Stripe/PayPal/Google Pay), membership subscriptions + points engine, trade portal + invoicing, and the two-way GoHighLevel sync.
