import type { Product, Category } from "@/generated/prisma/client";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import ImageField from "@/components/admin/media/image-field";
import GalleryField from "@/components/admin/media/gallery-field";
import {
  TextField,
  TextareaField,
  SelectField,
  CheckField,
} from "@/components/admin/ui/field";

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
    <form action={action}>
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="row g-4">
        {/* Main column */}
        <div className="col-12 col-lg-8">
          <FormSection title="General">
            <TextField name="name" label="Name" defaultValue={product?.name ?? ""} required col="col-md-7" />
            <TextField name="sku" label="SKU" defaultValue={product?.sku ?? ""} required col="col-md-5" />
            <TextField
              name="slug"
              label="Slug"
              defaultValue={product?.slug ?? ""}
              col="col-md-6"
              hint="Leave blank to auto-generate from the name."
            />
            <TextField
              name="subtitle"
              label="Subtitle / spec line"
              defaultValue={product?.subtitle ?? ""}
              col="col-md-6"
            />
            <TextareaField
              name="description"
              label="Description"
              defaultValue={product?.description ?? ""}
              rows={4}
            />
          </FormSection>

          <FormSection title="Pricing">
            <TextField name="basePrice" label="Base price (£)" type="number" step="0.01" defaultValue={dec(product?.basePrice)} col="col-md-4" />
            <TextField name="basePoints" label="Base points" type="number" defaultValue={product?.basePoints ?? 0} col="col-md-4" />
            <CheckField name="onSale" label="On sale" defaultChecked={product?.onSale ?? false} col="col-md-4" />
            <TextField name="salePrice" label="Sale price (£)" type="number" step="0.01" defaultValue={dec(product?.salePrice)} col="col-md-6" />
            <TextField name="saleEndDate" label="Sale ends" type="date" defaultValue={dateInput(product?.saleEndDate)} col="col-md-6" />
          </FormSection>

          <FormSection title="Inventory">
            <TextField name="stockQty" label="Stock qty" type="number" defaultValue={product?.stockQty ?? 0} col="col-md-6" />
            <TextField name="maxQtyPerOrder" label="Max qty / order" type="number" defaultValue={dec(product?.maxQtyPerOrder)} col="col-md-6" />
          </FormSection>

          <FormSection title="Attributes" description="Rum and apparel specifics — leave blank where not relevant.">
            <TextField name="abv" label="ABV (%)" type="number" step="0.1" defaultValue={dec(product?.abv)} col="col-md-3" />
            <TextField name="volume" label="Volume" defaultValue={product?.volume ?? ""} placeholder="70cl" col="col-md-3" />
            <TextField name="origin" label="Origin" defaultValue={product?.origin ?? ""} placeholder="Jamaica" col="col-md-3" />
            <TextField name="material" label="Material (apparel)" defaultValue={product?.material ?? ""} col="col-md-3" />
          </FormSection>
        </div>

        {/* Right rail */}
        <div className="col-12 col-lg-4">
          <FormSection title="Status">
            <SelectField name="status" label="Status" options={STATUSES} defaultValue={product?.status ?? "draft"} col="col-12" />
          </FormSection>

          <FormSection title="Organisation">
            <SelectField name="type" label="Product type" options={TYPES} defaultValue={product?.type ?? "rum"} col="col-12" />
            <SelectField
              name="categoryId"
              label="Category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              defaultValue={product?.categoryId ?? ""}
              blankLabel="— none —"
              col="col-12"
            />
          </FormSection>

          <FormSection title="Media">
            <ImageField
              name="imageUrl"
              label="Primary image"
              value={product?.imageUrl ?? ""}
              col="col-12"
              hint="Upload a file or choose from the media library."
            />
            <GalleryField
              name="galleryImages"
              label="Gallery images"
              value={product?.galleryImages ?? []}
              hint="Add more images and drag to reorder."
            />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/products" />
    </form>
  );
}
