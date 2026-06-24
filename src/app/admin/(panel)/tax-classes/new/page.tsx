import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { createTaxClass } from "../actions";

export default function NewTaxClass() {
  return (
    <>
      <PageHeader title="New tax class" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Tax classes", href: "/admin/tax-classes" }, { label: "New" }]} />
      <form action={createTaxClass} style={{ maxWidth: 560 }}>
        <FormSection title="Tax class">
          <div className="col-md-7"><label className="form-label" htmlFor="name">Name</label><input id="name" name="name" className="form-control" placeholder="e.g. Reduced rate" required /></div>
          <div className="col-md-5"><label className="form-label" htmlFor="ratePct">VAT rate (%)</label><input id="ratePct" name="ratePct" type="number" step="0.01" className="form-control" defaultValue="20" /></div>
          <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" name="isDefault" id="isDefault" /><label className="form-check-label" htmlFor="isDefault">Store default tax class</label></div></div>
        </FormSection>
        <SaveBar submitLabel="Create tax class" cancelHref="/admin/tax-classes" />
      </form>
    </>
  );
}
