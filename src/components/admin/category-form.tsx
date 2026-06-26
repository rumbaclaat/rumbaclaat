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
    <form action={action} style={{ maxWidth: 820 }}>
      {category && <input type="hidden" name="id" value={category.id} />}

      <FormSection title="Category">
        <TextField name="name" label="Name" defaultValue={category?.name ?? ""} required col="col-md-8" />
        <TextField name="sortOrder" label="Sort order" type="number" defaultValue={category?.sortOrder ?? 0} col="col-md-4" />
        <TextField name="slug" label="Slug" defaultValue={category?.slug ?? ""} col="col-12" hint="Leave blank to auto-generate." />
        <TextareaField name="description" label="Description" defaultValue={category?.description ?? ""} rows={5} hint="Shown on the category landing page and in search results." />
      </FormSection>

      <FormSection title="Image">
        <ImageField name="heroImage" label="Hero image" value={category?.heroImage ?? ""} col="col-12" />
      </FormSection>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/categories" />
    </form>
  );
}
