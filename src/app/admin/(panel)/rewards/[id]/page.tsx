import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { updateReward } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditReward({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.reward.findUnique({ where: { id } });
  if (!r) notFound();
  return (
    <>
      <PageHeader title="Edit reward" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Rewards", href: "/admin/rewards" }, { label: r.name }]} />
      <form action={updateReward} style={{ maxWidth: 720 }}>
        <input type="hidden" name="id" value={r.id} />
        <FormSection title="Reward">
          <div className="col-md-6"><label className="form-label" htmlFor="name">Name</label><input id="name" name="name" className="form-control" defaultValue={r.name} required /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="pointsCost">Points</label><input id="pointsCost" name="pointsCost" type="number" className="form-control" defaultValue={r.pointsCost} /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="value">Value</label><input id="value" name="value" className="form-control" defaultValue={r.value ?? ""} /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="type">Type</label><select id="type" name="type" className="form-select" defaultValue={r.type}><option value="credit">credit</option><option value="item">item</option><option value="access">access</option><option value="discount">discount</option><option value="experience">experience</option></select></div>
          <div className="col-md-4"><label className="form-label" htmlFor="availability">Availability</label><select id="availability" name="availability" className="form-select" defaultValue={r.availability}><option value="available">available</option><option value="coming_soon">coming soon</option><option value="disabled">disabled</option></select></div>
          <div className="col-12"><label className="form-label" htmlFor="description">Description</label><textarea id="description" name="description" rows={2} className="form-control" defaultValue={r.description ?? ""} /></div>
        </FormSection>
        <SaveBar submitLabel="Save changes" cancelHref="/admin/rewards" />
      </form>
    </>
  );
}
