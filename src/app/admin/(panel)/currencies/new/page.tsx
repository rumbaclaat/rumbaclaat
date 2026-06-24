import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { createCurrency } from "../actions";

export default function NewCurrency() {
  return (
    <>
      <PageHeader title="New currency" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Currencies", href: "/admin/currencies" }, { label: "New" }]} />
      <form action={createCurrency} style={{ maxWidth: 620 }}>
        <FormSection title="Currency">
          <div className="col-md-3"><label className="form-label" htmlFor="code">Code</label><input id="code" name="code" className="form-control" placeholder="EUR" maxLength={3} required /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="symbol">Symbol</label><input id="symbol" name="symbol" className="form-control" placeholder="€" required /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="rate">Rate vs base (GBP)</label><input id="rate" name="rate" type="number" step="0.0001" className="form-control" defaultValue="1" /></div>
          <div className="col-12 d-flex gap-3">
            <div className="form-check"><input className="form-check-input" type="checkbox" name="isBase" id="isBase" /><label className="form-check-label" htmlFor="isBase">Base currency</label></div>
            <div className="form-check"><input className="form-check-input" type="checkbox" name="active" id="active" defaultChecked /><label className="form-check-label" htmlFor="active">Active</label></div>
          </div>
        </FormSection>
        <SaveBar submitLabel="Create currency" cancelHref="/admin/currencies" />
      </form>
    </>
  );
}
