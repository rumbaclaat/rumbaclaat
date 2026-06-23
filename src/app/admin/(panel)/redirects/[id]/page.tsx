import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { updateRedirect } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.redirect.findUnique({ where: { id } });
  if (!r) notFound();
  return (
    <>
      <PageHeader title="Edit redirect" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Redirects", href: "/admin/redirects" }, { label: r.fromPath }]} />
      <form action={updateRedirect} style={{ maxWidth: 620 }}>
        <input type="hidden" name="id" value={r.id} />
        <FormSection title="Redirect">
          <div className="col-md-6"><label className="form-label" htmlFor="fromPath">From path</label><input id="fromPath" name="fromPath" className="form-control" defaultValue={r.fromPath} required /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="toPath">To path</label><input id="toPath" name="toPath" className="form-control" defaultValue={r.toPath} required /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="statusCode">Code</label><select id="statusCode" name="statusCode" className="form-select" defaultValue={r.statusCode}><option value="301">301 permanent</option><option value="302">302 temporary</option></select></div>
          <div className="col-md-4 d-flex align-items-end"><div className="form-check"><input className="form-check-input" type="checkbox" name="active" id="active" defaultChecked={r.active} /><label className="form-check-label" htmlFor="active">Active</label></div></div>
        </FormSection>
        <SaveBar submitLabel="Save changes" cancelHref="/admin/redirects" />
      </form>
    </>
  );
}
