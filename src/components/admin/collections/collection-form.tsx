import type { Collection } from "@/generated/prisma/client";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import ImageField from "@/components/admin/media/image-field";
import { TextField, TextareaField, CheckField } from "@/components/admin/ui/field";

export default function CollectionForm({
  action,
  collection,
  submitLabel,
}: {
  action: (fd: FormData) => void | Promise<void>;
  collection?: Collection;
  submitLabel: string;
}) {
  return (
    <form action={action} style={{ maxWidth: 760 }}>
      {collection && <input type="hidden" name="id" value={collection.id} />}
      <FormSection title="Collection">
        <TextField name="name" label="Name" defaultValue={collection?.name ?? ""} required col="col-md-7" />
        <TextField name="slug" label="Slug" defaultValue={collection?.slug ?? ""} col="col-md-5" hint="Leave blank to auto-generate." />
        <TextareaField name="description" label="Description" defaultValue={collection?.description ?? ""} rows={3} />
        <CheckField name="active" label="Active (visible on the storefront)" defaultChecked={collection?.active ?? true} />
      </FormSection>
      <FormSection title="Images">
        <ImageField name="image" label="Card image" value={collection?.image ?? ""} col="col-md-6" />
        <ImageField name="heroImage" label="Hero image" value={collection?.heroImage ?? ""} col="col-md-6" />
      </FormSection>
      <SaveBar submitLabel={submitLabel} cancelHref="/admin/collections" />
    </form>
  );
}
