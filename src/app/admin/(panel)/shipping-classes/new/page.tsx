import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { createShippingClass } from "../actions";

export default function NewShippingClass() {
  return (
    <>
      <PageHeader title="New shipping class" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Shipping classes", href: "/admin/shipping-classes" }, { label: "New" }]} />
      <form action={createShippingClass} style={{ maxWidth: 620 }}>
        <FormSection title="Shipping class">
          <div className="col-12"><label className="form-label" htmlFor="name">Name</label><input id="name" name="name" className="form-control" placeholder="e.g. Heavy / Glass" required /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="price">Price (£)</label><input id="price" name="price" type="number" step="0.01" className="form-control" defaultValue="4.99" /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="freeOver">Free over (£)</label><input id="freeOver" name="freeOver" type="number" step="0.01" className="form-control" /></div>
          <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" name="isDefault" id="isDefault" /><label className="form-check-label" htmlFor="isDefault">Store default shipping class</label></div></div>
        </FormSection>
        <SaveBar submitLabel="Create shipping class" cancelHref="/admin/shipping-classes" />
      </form>
    </>
  );
}
