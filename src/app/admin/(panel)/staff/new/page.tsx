import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField, SelectField } from "@/components/admin/ui/field";
import { inviteStaff } from "../actions";

export const dynamic = "force-dynamic";

const ROLES = ["super_admin", "content_editor", "catalogue_manager", "order_manager", "membership_manager", "trade_manager", "marketing_manager"];

export default function NewStaffPage() {
  return (
    <>
      <PageHeader
        title="Invite a manager"
        subtitle="Sends a Supabase email invite when SMTP is configured; otherwise creates a pending account you can link later."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Staff", href: "/admin/staff" }, { label: "New" }]}
      />
      <form action={inviteStaff}>
        <div className="admin-product-grid">
          <div className="admin-product-main">
            <FormSection title="Account" description="The person receives an invite to set their password. You can fine-tune their permissions once the account exists.">
              <TextField name="email" label="Email" type="email" required col="col-md-6" />
              <TextField name="name" label="Name" col="col-md-6" />
            </FormSection>
          </div>

          <div className="admin-product-rail">
            <FormSection title="Role">
              <SelectField name="role" label="Role" options={ROLES.map((r) => ({ value: r, label: r.replace(/_/g, " ") }))} col="col-12" />
              <p className="admin-form-section-desc" style={{ margin: 0 }}>
                The role grants a preset of permissions. Open the staff member after creating to switch to custom permissions.
              </p>
            </FormSection>
          </div>
        </div>

        <SaveBar submitLabel="Send invite" cancelHref="/admin/staff" />
      </form>
    </>
  );
}
