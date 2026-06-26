import type { Banner } from "@/generated/prisma/client";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField, SelectField, CheckField } from "@/components/admin/ui/field";

function dateInput(d: Date | null | undefined): string {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export default function BannerForm({
  action,
  banner,
  submitLabel,
}: {
  action: (fd: FormData) => void | Promise<void>;
  banner?: Banner;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      {banner && <input type="hidden" name="id" value={banner.id} />}

      <div className="admin-product-grid">
        <div className="admin-product-main">
          <FormSection title="Banner">
            <TextField name="message" label="Message" defaultValue={banner?.message ?? ""} required col="col-12" />
            <TextField name="detail" label="Detail" defaultValue={banner?.detail ?? ""} col="col-md-6" />
            <TextField name="link" label="Link URL" defaultValue={banner?.link ?? ""} col="col-md-6" />
            <TextField name="icon" label="Icon" defaultValue={banner?.icon ?? ""} col="col-md-6" hint="e.g. bi-truck or an emoji." />
          </FormSection>
        </div>

        <div className="admin-product-rail">
          <FormSection title="Publish">
            <SelectField name="type" label="Type" options={["announcement", "promotional", "info", "warning", "success"]} defaultValue={banner?.type ?? "announcement"} col="col-12" />
            <CheckField name="active" label="Active" defaultChecked={banner?.active ?? true} col="col-12" />
            <TextField name="startDate" label="Starts" type="date" defaultValue={dateInput(banner?.startDate)} col="col-12" />
            <TextField name="endDate" label="Ends" type="date" defaultValue={dateInput(banner?.endDate)} col="col-12" />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/banners" />
    </form>
  );
}
