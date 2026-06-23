import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { updateTaxClass } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditTaxClass({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await prisma.taxClass.findUnique({ where: { id } });
  if (!t) notFound();
  return (
    <>
      <PageHeader title="Edit tax class" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Tax classes", href: "/admin/tax-classes" }, { label: t.name }]} />
      <form action={updateTaxClass} style={{ maxWidth: 560 }}>
        <input type="hidden" name="id" value={t.id} />
        <FormSection title="Tax class">
          <div className="col-md-7"><label className="form-label" htmlFor="name">Name</label><input id="name" name="name" className="form-control" defaultValue={t.name} required /></div>
          <div className="col-md-5"><label className="form-label" htmlFor="ratePct">VAT rate (%)</label><input id="ratePct" name="ratePct" type="number" step="0.01" className="form-control" defaultValue={Number(t.ratePct)} /></div>
          <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" name="isDefault" id="isDefault" defaultChecked={t.isDefault} /><label className="form-check-label" htmlFor="isDefault">Store default tax class</label></div></div>
        </FormSection>
        <SaveBar submitLabel="Save changes" cancelHref="/admin/tax-classes" />
      </form>
    </>
  );
}
