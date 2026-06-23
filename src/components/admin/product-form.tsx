import Link from "next/link";
import type { Product, Category } from "@/generated/prisma/client";

const TYPES = ["rum", "apparel", "cap", "gift_card"];
const STATUSES = ["draft", "published", "archived"];

function dec(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}
function dateInput(d: Date | null | undefined): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function ProductForm({
  action,
  product,
  categories,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  categories: Category[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="admin-card">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="name">Name *</label>
          <input id="name" name="name" className="form-control" defaultValue={product?.name ?? ""} required />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="sku">SKU *</label>
          <input id="sku" name="sku" className="form-control" defaultValue={product?.sku ?? ""} required />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="status">Status</label>
          <select id="status" name="status" className="form-select" defaultValue={product?.status ?? "draft"}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label" htmlFor="type">Type</label>
          <select id="type" name="type" className="form-select" defaultValue={product?.type ?? "rum"}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="col-md-5">
          <label className="form-label" htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" className="form-select" defaultValue={product?.categoryId ?? ""}>
            <option value="">— none —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="slug">Slug <span style={{ color: "var(--text-dim)" }}>(auto if blank)</span></label>
          <input id="slug" name="slug" className="form-control" defaultValue={product?.slug ?? ""} />
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="subtitle">Subtitle / spec line</label>
          <input id="subtitle" name="subtitle" className="form-control" defaultValue={product?.subtitle ?? ""} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} className="form-control" defaultValue={product?.description ?? ""} />
        </div>

        <div className="col-md-3">
          <label className="form-label" htmlFor="basePrice">Base price (£)</label>
          <input id="basePrice" name="basePrice" type="number" step="0.01" className="form-control" defaultValue={dec(product?.basePrice)} />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="basePoints">Base points</label>
          <input id="basePoints" name="basePoints" type="number" className="form-control" defaultValue={product?.basePoints ?? 0} />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="stockQty">Stock qty</label>
          <input id="stockQty" name="stockQty" type="number" className="form-control" defaultValue={product?.stockQty ?? 0} />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="maxQtyPerOrder">Max qty / order</label>
          <input id="maxQtyPerOrder" name="maxQtyPerOrder" type="number" className="form-control" defaultValue={dec(product?.maxQtyPerOrder)} />
        </div>

        <div className="col-md-3 d-flex align-items-end">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="onSale" name="onSale" defaultChecked={product?.onSale ?? false} />
            <label className="form-check-label" htmlFor="onSale">On sale</label>
          </div>
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="salePrice">Sale price (£)</label>
          <input id="salePrice" name="salePrice" type="number" step="0.01" className="form-control" defaultValue={dec(product?.salePrice)} />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="saleEndDate">Sale ends</label>
          <input id="saleEndDate" name="saleEndDate" type="date" className="form-control" defaultValue={dateInput(product?.saleEndDate)} />
        </div>

        <div className="col-md-3">
          <label className="form-label" htmlFor="abv">ABV (%)</label>
          <input id="abv" name="abv" type="number" step="0.1" className="form-control" defaultValue={dec(product?.abv)} />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="volume">Volume</label>
          <input id="volume" name="volume" className="form-control" defaultValue={product?.volume ?? ""} placeholder="70cl" />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="origin">Origin</label>
          <input id="origin" name="origin" className="form-control" defaultValue={product?.origin ?? ""} placeholder="Jamaica" />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="material">Material (apparel)</label>
          <input id="material" name="material" className="form-control" defaultValue={product?.material ?? ""} />
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="imageUrl">Primary image URL <span style={{ color: "var(--text-dim)" }}>(upload in Media, paste the URL)</span></label>
          <input id="imageUrl" name="imageUrl" className="form-control" defaultValue={product?.imageUrl ?? ""} placeholder="https://…" />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="galleryImages">Gallery image URLs <span style={{ color: "var(--text-dim)" }}>(one per line)</span></label>
          <textarea id="galleryImages" name="galleryImages" rows={3} className="form-control" defaultValue={(product?.galleryImages ?? []).join("\n")} />
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-gold">{submitLabel}</button>
        <Link href="/admin/products" className="btn btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
