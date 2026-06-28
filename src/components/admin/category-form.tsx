import type { Category } from "@/generated/prisma/client";
import ImageField from "@/components/admin/media/image-field";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField, TextareaField } from "@/components/admin/ui/field";

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
    <form action={action}>
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="admin-product-grid">
        {/* Main column */}
        <div className="admin-product-main">
          <FormSection title="Details">
            <TextField name="name" label="Name" defaultValue={category?.name ?? ""} required col="col-12" />
            <TextareaField name="description" label="Description" defaultValue={category?.description ?? ""} rows={5} hint="Shown on the category landing page and in search results." />
          </FormSection>

          <FormSection title="Image">
            <ImageField name="heroImage" label="Hero image" value={category?.heroImage ?? ""} col="col-12" />
          </FormSection>
        </div>

        {/* Persistent rail */}
        <div className="admin-product-rail">
          <FormSection title="Organisation">
            <TextField name="slug" label="Slug" defaultValue={category?.slug ?? ""} col="col-12" hint="Leave blank to auto-generate." />
            <TextField name="sortOrder" label="Sort order" type="number" defaultValue={category?.sortOrder ?? 0} col="col-12" />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/categories" />
    </form>
  );
}
