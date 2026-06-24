import type { Product, Category } from "@/generated/prisma/client";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import ImageField from "@/components/admin/media/image-field";
import GalleryField from "@/components/admin/media/gallery-field";
import { TextField, TextareaField, SelectField, CheckField, Field } from "@/components/admin/ui/field";
import ProductAttributes from "@/components/admin/products/product-attributes";

const STATUSES = ["draft", "published", "archived"];

function dec(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}
function dateInput(d: Date | null | undefined): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}
function dtLocal(d: Date | null | undefined): string {
  return d ? new Date(d).toISOString().slice(0, 16) : "";
}

type Opt = { id: string; name: string };

export default function ProductForm({
  action,
  product,
  categories,
  collections = [],
  taxClasses = [],
  shippingClasses = [],
  collectionIds = [],
  initialType,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  categories: Category[];
  collections?: Opt[];
  taxClasses?: Opt[];
  shippingClasses?: Opt[];
  collectionIds?: string[];
  initialType?: string;
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
            <TextField name="slug" label="Slug" defaultValue={product?.slug ?? ""} col="col-md-6" hint="Leave blank to auto-generate." />
            <TextField name="subtitle" label="Subtitle / spec line" defaultValue={product?.subtitle ?? ""} col="col-md-6" />
            <TextareaField name="description" label="Description" defaultValue={product?.description ?? ""} rows={4} />
          </FormSection>

          <FormSection title="Pricing">
            <TextField name="basePrice" label="Base price (£)" type="number" step="0.01" defaultValue={dec(product?.basePrice)} col="col-md-4" />
            <TextField name="basePoints" label="Base points" type="number" defaultValue={product?.basePoints ?? 0} col="col-md-4" />
            <CheckField name="onSale" label="On sale" defaultChecked={product?.onSale ?? false} col="col-md-4" />
            <TextField name="salePrice" label="Sale price (£)" type="number" step="0.01" defaultValue={dec(product?.salePrice)} col="col-md-6" />
            <TextField name="saleEndDate" label="Sale ends" type="date" defaultValue={dateInput(product?.saleEndDate)} col="col-md-6" />
          </FormSection>

          <FormSection title="Inventory">
            <TextField name="stockQty" label="Stock qty" type="number" defaultValue={product?.stockQty ?? 0} col="col-md-4" />
            <TextField name="lowStockThreshold" label="Low-stock alert at" type="number" defaultValue={product?.lowStockThreshold ?? 5} col="col-md-4" hint="Flags on the dashboard." />
            <TextField name="maxQtyPerOrder" label="Max qty / order" type="number" defaultValue={dec(product?.maxQtyPerOrder)} col="col-md-4" />
          </FormSection>

          <ProductAttributes
            initialType={product?.type ?? initialType ?? "rum"}
            d={{
              abv: dec(product?.abv),
              volume: product?.volume ?? "",
              origin: product?.origin ?? "",
              tastingNotes: product?.tastingNotes ?? "",
              caskType: product?.caskType ?? "",
              ageStatement: product?.ageStatement ?? "",
              material: product?.material ?? "",
              gsm: product?.gsm ?? "",
              fit: product?.fit ?? "",
              careInstructions: product?.careInstructions ?? "",
            }}
          />

          <FormSection title="Search engine (SEO)">
            <TextField name="seoTitle" label="SEO title" defaultValue={product?.seoTitle ?? ""} col="col-md-6" />
            <TextField name="canonical" label="Canonical URL" defaultValue={product?.canonical ?? ""} col="col-md-6" />
            <TextareaField name="seoDescription" label="Meta description" defaultValue={product?.seoDescription ?? ""} rows={2} />
          </FormSection>
        </div>

        {/* Right rail */}
        <div className="col-12 col-lg-4">
          <FormSection title="Status & scheduling">
            <SelectField name="status" label="Status" options={STATUSES} defaultValue={product?.status ?? "draft"} col="col-12" />
            <TextField name="publishAt" label="Publish at" type="datetime-local" defaultValue={dtLocal(product?.publishAt)} col="col-12" hint="Auto-publish at this time (optional)." />
            <TextField name="unpublishAt" label="Unpublish at" type="datetime-local" defaultValue={dtLocal(product?.unpublishAt)} col="col-12" />
          </FormSection>

          <FormSection title="Organisation">
            <SelectField name="categoryId" label="Primary category" options={categories.map((c) => ({ value: c.id, label: c.name }))} defaultValue={product?.categoryId ?? ""} blankLabel="— none —" col="col-12" />
            <Field label="Collections" htmlFor="collections" col="col-12" hint="Ctrl / Cmd-click to select several.">
              <select id="collections" name="collections" className="form-select" multiple size={Math.min(6, Math.max(3, collections.length))} defaultValue={collectionIds}>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <SelectField name="taxClassId" label="Tax class" options={taxClasses.map((c) => ({ value: c.id, label: c.name }))} defaultValue={product?.taxClassId ?? ""} blankLabel="— store default —" col="col-12" />
            <SelectField name="shippingClassId" label="Shipping class" options={shippingClasses.map((c) => ({ value: c.id, label: c.name }))} defaultValue={product?.shippingClassId ?? ""} blankLabel="— store default —" col="col-12" />
          </FormSection>

          <FormSection title="Media">
            <ImageField name="imageUrl" label="Primary image" value={product?.imageUrl ?? ""} col="col-12" hint="Upload a file or choose from the media library." />
            <GalleryField name="galleryImages" label="Gallery images" value={product?.galleryImages ?? []} hint="Add more images and drag to reorder." />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/products" />
    </form>
  );
}
