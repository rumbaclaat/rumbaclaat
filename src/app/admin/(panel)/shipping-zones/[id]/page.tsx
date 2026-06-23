import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { updateZone } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditZone({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const z = await prisma.shippingZone.findUnique({ where: { id } });
  if (!z) notFound();
  return (
    <>
      <PageHeader title="Edit zone" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Shipping zones", href: "/admin/shipping-zones" }, { label: z.name }]} />
      <form action={updateZone} style={{ maxWidth: 620 }}>
        <input type="hidden" name="id" value={z.id} />
        <FormSection title="Zone">
          <div className="col-md-6"><label className="form-label" htmlFor="name">Name</label><input id="name" name="name" className="form-control" defaultValue={z.name} required /></div>
          <div className="col-12"><label className="form-label" htmlFor="countries">Countries (comma-separated)</label><input id="countries" name="countries" className="form-control" defaultValue={z.countries.join(", ")} /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="price">Price (£)</label><input id="price" name="price" type="number" step="0.01" className="form-control" defaultValue={Number(z.price)} /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="freeOver">Free over (£)</label><input id="freeOver" name="freeOver" type="number" step="0.01" className="form-control" defaultValue={z.freeOver != null ? Number(z.freeOver) : ""} /></div>
        </FormSection>
        <SaveBar submitLabel="Save changes" cancelHref="/admin/shipping-zones" />
      </form>
    </>
  );
}
