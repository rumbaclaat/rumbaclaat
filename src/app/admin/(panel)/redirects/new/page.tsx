import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { createRedirect } from "../actions";

export default function NewRedirect() {
  return (
    <>
      <PageHeader title="New redirect" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Redirects", href: "/admin/redirects" }, { label: "New" }]} />
      <form action={createRedirect} style={{ maxWidth: 680 }}>
        <FormSection title="Redirect">
          <div className="col-md-6"><label className="form-label" htmlFor="fromPath">From path</label><input id="fromPath" name="fromPath" className="form-control" placeholder="/old-url" required /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="toPath">To path</label><input id="toPath" name="toPath" className="form-control" placeholder="/new-url" required /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="statusCode">Code</label><select id="statusCode" name="statusCode" className="form-select"><option value="301">301 permanent</option><option value="302">302 temporary</option></select></div>
          <div className="col-md-4 d-flex align-items-end"><div className="form-check"><input className="form-check-input" type="checkbox" name="active" id="active" defaultChecked /><label className="form-check-label" htmlFor="active">Active</label></div></div>
        </FormSection>
        <SaveBar submitLabel="Create redirect" cancelHref="/admin/redirects" />
      </form>
    </>
  );
}
