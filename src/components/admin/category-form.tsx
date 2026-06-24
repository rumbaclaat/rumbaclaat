import Link from "next/link";
import type { Category } from "@/generated/prisma/client";
import ImageField from "@/components/admin/media/image-field";

export default function CategoryForm({
  action,
  category,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  category?: Category;
  submitLabel: string;
}) {
  return (
    <form action={action} className="admin-card" style={{ maxWidth: 640 }}>
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="row g-3">
        <div className="col-sm-8">
          <label className="form-label" htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            name="name"
            className="form-control"
            defaultValue={category?.name ?? ""}
            required
          />
        </div>
        <div className="col-sm-4">
          <label className="form-label" htmlFor="sortOrder">
            Sort order
          </label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            className="form-control"
            defaultValue={category?.sortOrder ?? 0}
          />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="slug">
            Slug <span style={{ color: "var(--text-dim)" }}>(leave blank to auto-generate)</span>
          </label>
          <input
            id="slug"
            name="slug"
            className="form-control"
            defaultValue={category?.slug ?? ""}
          />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="form-control"
            defaultValue={category?.description ?? ""}
          />
        </div>
        <ImageField name="heroImage" label="Hero image" value={category?.heroImage ?? ""} col="col-12" />
      </div>
      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-gold">
          {submitLabel}
        </button>
        <Link href="/admin/categories" className="btn btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
