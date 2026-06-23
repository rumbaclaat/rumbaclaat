import Link from "next/link";
import type { Cocktail, Product } from "@/generated/prisma/client";

function lines(v: unknown): string {
  return Array.isArray(v) ? v.join("\n") : "";
}
function pairs(v: unknown): string {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, val]) => `${k} | ${val}`)
      .join("\n");
  }
  return "";
}

const DIFFICULTY = ["", "Easy", "Medium", "Hard"];

export default function CocktailForm({
  action,
  cocktail,
  products,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  cocktail?: Cocktail;
  products: Product[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="admin-card">
      {cocktail && <input type="hidden" name="id" value={cocktail.id} />}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label" htmlFor="name">Name *</label>
          <input id="name" name="name" className="form-control" defaultValue={cocktail?.name ?? ""} required />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" name="difficulty" className="form-select" defaultValue={cocktail?.difficulty ?? ""}>
            {DIFFICULTY.map((d) => <option key={d} value={d}>{d || "—"}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="status">Status</label>
          <select id="status" name="status" className="form-select" defaultValue={cocktail?.status ?? "draft"}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label" htmlFor="eyebrow">Eyebrow</label>
          <input id="eyebrow" name="eyebrow" className="form-control" defaultValue={cocktail?.eyebrow ?? ""} />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="occasion">Occasion</label>
          <input id="occasion" name="occasion" className="form-control" defaultValue={cocktail?.occasion ?? ""} />
        </div>
        <div className="col-md-2">
          <label className="form-label" htmlFor="timeMins">Time (mins)</label>
          <input id="timeMins" name="timeMins" type="number" className="form-control" defaultValue={cocktail?.timeMins ?? ""} />
        </div>
        <div className="col-md-2">
          <label className="form-label" htmlFor="slug">Slug</label>
          <input id="slug" name="slug" className="form-control" defaultValue={cocktail?.slug ?? ""} />
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="lede">Lede</label>
          <textarea id="lede" name="lede" rows={2} className="form-control" defaultValue={cocktail?.lede ?? ""} />
        </div>

        <div className="col-md-6">
          <label className="form-label" htmlFor="ingredients">Ingredients (one per line)</label>
          <textarea id="ingredients" name="ingredients" rows={6} className="form-control" defaultValue={lines(cocktail?.ingredients)} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="method">Method steps (one per line)</label>
          <textarea id="method" name="method" rows={6} className="form-control" defaultValue={lines(cocktail?.method)} />
        </div>

        <div className="col-md-6">
          <label className="form-label" htmlFor="serviceNotes">Service notes (key | value per line)</label>
          <textarea id="serviceNotes" name="serviceNotes" rows={4} className="form-control" defaultValue={pairs(cocktail?.serviceNotes)} placeholder={"Glassware | Coupe\nGarnish | Lime twist"} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="bartenderTip">Bartender tip</label>
          <textarea id="bartenderTip" name="bartenderTip" rows={4} className="form-control" defaultValue={cocktail?.bartenderTip ?? ""} />
        </div>

        <div className="col-md-8">
          <label className="form-label" htmlFor="image">Image URL</label>
          <input id="image" name="image" className="form-control" defaultValue={cocktail?.image ?? ""} />
        </div>
        <div className="col-md-4">
          <label className="form-label" htmlFor="featuredProductId">Featured rum</label>
          <select id="featuredProductId" name="featuredProductId" className="form-select" defaultValue={cocktail?.featuredProductId ?? ""}>
            <option value="">— none —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label" htmlFor="ratingAvg">Rating (0–5)</label>
          <input id="ratingAvg" name="ratingAvg" type="number" step="0.1" min="0" max="5" className="form-control" defaultValue={cocktail?.ratingAvg != null ? String(cocktail.ratingAvg) : ""} />
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="ratingCount">Rating count</label>
          <input id="ratingCount" name="ratingCount" type="number" className="form-control" defaultValue={cocktail?.ratingCount ?? 0} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="tags">Tags (one per line)</label>
          <textarea id="tags" name="tags" rows={2} className="form-control" defaultValue={(cocktail?.tags ?? []).join("\n")} placeholder={"Citrus\nClassic"} />
        </div>
      </div>

      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-gold">{submitLabel}</button>
        <Link href="/admin/cocktails" className="btn btn-ghost">Cancel</Link>
      </div>
    </form>
  );
}
