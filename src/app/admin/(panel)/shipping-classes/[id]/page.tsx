import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { updateShippingClass } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditShippingClass({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await prisma.shippingClass.findUnique({ where: { id } });
  if (!s) notFound();
  return (
    <>
      <PageHeader title="Edit shipping class" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Shipping classes", href: "/admin/shipping-classes" }, { label: s.name }]} />
      <form action={updateShippingClass} style={{ maxWidth: 560 }}>
        <input type="hidden" name="id" value={s.id} />
        <FormSection title="Shipping class">
          <div className="col-12"><label className="form-label" htmlFor="name">Name</label><input id="name" name="name" className="form-control" defaultValue={s.name} required /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="price">Price (£)</label><input id="price" name="price" type="number" step="0.01" className="form-control" defaultValue={Number(s.price)} /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="freeOver">Free over (£)</label><input id="freeOver" name="freeOver" type="number" step="0.01" className="form-control" defaultValue={s.freeOver != null ? Number(s.freeOver) : ""} /></div>
          <div className="col-12"><div className="form-check"><input className="form-check-input" type="checkbox" name="isDefault" id="isDefault" defaultChecked={s.isDefault} /><label className="form-check-label" htmlFor="isDefault">Store default shipping class</label></div></div>
        </FormSection>
        <SaveBar submitLabel="Save changes" cancelHref="/admin/shipping-classes" />
      </form>
    </>
  );
}
