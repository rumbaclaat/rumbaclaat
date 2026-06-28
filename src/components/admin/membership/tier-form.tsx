import type { MembershipTier } from "@/generated/prisma/client";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField, TextareaField, CheckField } from "@/components/admin/ui/field";

export default function TierForm({
  action,
  tier,
  submitLabel,
}: {
  action: (fd: FormData) => void | Promise<void>;
  tier?: MembershipTier;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      {tier && <input type="hidden" name="id" value={tier.id} />}

      <div className="admin-product-grid">
        {/* Main column — titled field groups */}
        <div className="admin-product-main">
          <FormSection title="Details">
            <TextField name="name" label="Name" defaultValue={tier?.name ?? ""} required col="col-md-6" />
            <TextField name="slug" label="Slug" defaultValue={tier?.slug ?? ""} col="col-md-6" hint="Leave blank to auto-generate." />
          </FormSection>

          <FormSection title="Pricing & points">
            <TextField name="priceMonthly" label="Monthly price (£)" type="number" step="0.01" defaultValue={tier ? Number(tier.priceMonthly) : 0} col="col-md-3" />
            <TextField name="priceAnnual" label="Annual price (£)" type="number" step="0.01" defaultValue={tier ? Number(tier.priceAnnual) : 0} col="col-md-3" />
            <TextField name="pointsMultiplier" label="Points multiplier" type="number" step="0.1" defaultValue={tier ? Number(tier.pointsMultiplier) : 1} col="col-md-3" />
            <TextField name="memberDiscountPct" label="Member discount (%)" type="number" defaultValue={tier?.memberDiscountPct ?? 0} col="col-md-3" />
          </FormSection>

          <FormSection title="Benefits">
            <TextareaField name="benefits" label="Benefits" defaultValue={(tier?.benefits ?? []).join("\n")} rows={6} hint="One per line." />
          </FormSection>
        </div>

        {/* Persistent rail */}
        <div className="admin-product-rail">
          <FormSection title="Publish" description="Sort order is set by dragging tiers on the membership list.">
            <CheckField name="isFree" label="Free tier (no subscription)" defaultChecked={tier?.isFree ?? false} col="col-12" />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/membership" />
    </form>
  );
}
