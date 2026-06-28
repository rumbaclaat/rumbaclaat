import type { Reward } from "@/generated/prisma/client";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField, TextareaField, SelectField } from "@/components/admin/ui/field";

const TYPES = ["credit", "item", "access", "discount", "experience"];
const AVAILABILITY = [
  { value: "available", label: "available" },
  { value: "coming_soon", label: "coming soon" },
  { value: "disabled", label: "disabled" },
];

export default function RewardForm({
  action,
  reward,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  reward?: Reward;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      {reward && <input type="hidden" name="id" value={reward.id} />}

      <div className="admin-product-grid">
        {/* Main column */}
        <div className="admin-product-main">
          <FormSection title="Reward">
            <TextField name="name" label="Name" defaultValue={reward?.name ?? ""} required col="col-12" />
            <TextareaField name="description" label="Description" defaultValue={reward?.description ?? ""} rows={3} />
          </FormSection>
        </div>

        {/* Persistent rail */}
        <div className="admin-product-rail">
          <FormSection title="Publish">
            <SelectField name="availability" label="Availability" options={AVAILABILITY} defaultValue={reward?.availability ?? "available"} col="col-12" />
          </FormSection>

          <FormSection title="Organisation">
            <SelectField name="type" label="Type" options={TYPES} defaultValue={reward?.type ?? "credit"} col="col-12" />
            <TextField name="pointsCost" label="Points" type="number" defaultValue={reward?.pointsCost ?? 500} col="col-md-6" />
            <TextField name="value" label="Value" defaultValue={reward?.value ?? ""} placeholder="£10" col="col-md-6" />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/rewards" />
    </form>
  );
}
