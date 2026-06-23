import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { updateCurrency } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditCurrency({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const c = await prisma.currency.findUnique({ where: { code } });
  if (!c) notFound();
  return (
    <>
      <PageHeader title={`Edit ${c.code}`} breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Currencies", href: "/admin/currencies" }, { label: c.code }]} />
      <form action={updateCurrency} style={{ maxWidth: 560 }}>
        <input type="hidden" name="origCode" value={c.code} />
        <input type="hidden" name="code" value={c.code} />
        <FormSection title="Currency">
          <div className="col-md-4"><label className="form-label">Code</label><input className="form-control" defaultValue={c.code} disabled /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="symbol">Symbol</label><input id="symbol" name="symbol" className="form-control" defaultValue={c.symbol} /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="rate">Rate vs base</label><input id="rate" name="rate" type="number" step="0.0001" className="form-control" defaultValue={Number(c.rate)} /></div>
          <div className="col-12 d-flex gap-3"><div className="form-check"><input className="form-check-input" type="checkbox" name="isBase" id="isBase" defaultChecked={c.isBase} /><label className="form-check-label" htmlFor="isBase">Base currency</label></div><div className="form-check"><input className="form-check-input" type="checkbox" name="active" id="active" defaultChecked={c.active} /><label className="form-check-label" htmlFor="active">Active</label></div></div>
        </FormSection>
        <SaveBar submitLabel="Save changes" cancelHref="/admin/currencies" />
      </form>
    </>
  );
}
