import type { Promotion } from "@/generated/prisma/client";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField, SelectField, CheckField } from "@/components/admin/ui/field";

function dateInput(d: Date | null | undefined): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function PromotionForm({
  action,
  promotion,
  submitLabel,
}: {
  action: (fd: FormData) => void | Promise<void>;
  promotion?: Promotion;
  submitLabel: string;
}) {
  return (
    <form action={action} style={{ maxWidth: 860 }}>
      {promotion && <input type="hidden" name="id" value={promotion.id} />}
      <FormSection title="Promotion">
        <TextField name="name" label="Name" defaultValue={promotion?.name ?? ""} required col="col-md-6" />
        <TextField name="code" label="Coupon code" defaultValue={promotion?.code ?? ""} col="col-md-3" hint="Blank = automatic promo." />
        <TextField name="badgeLabel" label="Badge label" defaultValue={promotion?.badgeLabel ?? ""} col="col-md-3" />
        <SelectField name="discountType" label="Discount type" options={[{ value: "percentage", label: "Percentage off" }, { value: "fixed", label: "Fixed £ off" }, { value: "free_shipping", label: "Free shipping" }, { value: "bogo", label: "Buy one get one" }]} defaultValue={promotion?.discountType ?? "percentage"} col="col-md-4" />
        <TextField name="value" label="Value" type="number" step="0.01" defaultValue={promotion ? Number(promotion.value) : 10} col="col-md-4" hint="% or £ depending on type." />
        <CheckField name="active" label="Active" defaultChecked={promotion?.active ?? true} col="col-md-4" />
      </FormSection>

      <FormSection title="Conditions">
        <SelectField name="appliesTo" label="Applies to" options={[{ value: "all", label: "All products" }, { value: "category", label: "Category" }, { value: "collection", label: "Collection" }, { value: "product", label: "Product" }, { value: "tier", label: "Membership tier" }, { value: "min_spend", label: "Minimum spend" }]} defaultValue={promotion?.appliesTo ?? "all"} col="col-md-4" />
        <TextField name="targetId" label="Target id" defaultValue={promotion?.targetId ?? ""} col="col-md-4" hint="Category/collection/product/tier id when scoped." />
        <TextField name="minSpend" label="Minimum spend (£)" type="number" step="0.01" defaultValue={promotion?.minSpend != null ? Number(promotion.minSpend) : ""} col="col-md-4" />
        <TextField name="usageLimit" label="Total uses limit" type="number" defaultValue={promotion?.usageLimit ?? ""} col="col-md-4" />
        <TextField name="perCustomerLimit" label="Per-customer limit" type="number" defaultValue={promotion?.perCustomerLimit ?? ""} col="col-md-4" />
      </FormSection>

      <FormSection title="Schedule">
        <TextField name="startDate" label="Starts" type="date" defaultValue={dateInput(promotion?.startDate)} col="col-md-6" />
        <TextField name="endDate" label="Ends" type="date" defaultValue={dateInput(promotion?.endDate)} col="col-md-6" />
      </FormSection>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/promotions" />
    </form>
  );
}
