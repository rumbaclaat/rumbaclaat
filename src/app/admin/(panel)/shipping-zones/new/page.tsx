import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { createZone } from "../actions";

export default function NewZone() {
  return (
    <>
      <PageHeader title="New shipping zone" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Shipping zones", href: "/admin/shipping-zones" }, { label: "New" }]} />
      <form action={createZone} style={{ maxWidth: 680 }}>
        <FormSection title="Zone">
          <div className="col-md-6"><label className="form-label" htmlFor="name">Name</label><input id="name" name="name" className="form-control" placeholder="e.g. Europe" required /></div>
          <div className="col-12"><label className="form-label" htmlFor="countries">Countries</label><input id="countries" name="countries" className="form-control" placeholder="FR, DE, ES (comma-separated)" /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="price">Price (£)</label><input id="price" name="price" type="number" step="0.01" className="form-control" defaultValue="12.99" /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="freeOver">Free over (£)</label><input id="freeOver" name="freeOver" type="number" step="0.01" className="form-control" /></div>
        </FormSection>
        <SaveBar submitLabel="Create zone" cancelHref="/admin/shipping-zones" />
      </form>
    </>
  );
}
