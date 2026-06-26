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
    <form action={action}>
      {collection && <input type="hidden" name="id" value={collection.id} />}

      <div className="admin-product-grid">
        <div className="admin-product-main">
          <FormSection title="Details">
            <TextField name="name" label="Name" defaultValue={collection?.name ?? ""} required col="col-12" />
            <TextField name="slug" label="Slug" defaultValue={collection?.slug ?? ""} col="col-12" hint="Leave blank to auto-generate." />
            <TextareaField name="description" label="Description" defaultValue={collection?.description ?? ""} rows={5} />
          </FormSection>

          <FormSection title="Images">
            <ImageField name="image" label="Card image" value={collection?.image ?? ""} col="col-md-6" />
            <ImageField name="heroImage" label="Hero image" value={collection?.heroImage ?? ""} col="col-md-6" />
          </FormSection>
        </div>

        <div className="admin-product-rail">
          <FormSection title="Publish">
            <CheckField name="active" label="Active (visible on the storefront)" defaultChecked={collection?.active ?? true} />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/collections" />
    </form>
  );
}
