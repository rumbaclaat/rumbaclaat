import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import SectionLabel from "@/components/admin/ui/section-label";
import FormSection from "@/components/admin/ui/form-section";
import { TextField, SelectField } from "@/components/admin/ui/field";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { inviteStaff, deleteStaff } from "./actions";

export const dynamic = "force-dynamic";

const ROLES = ["super_admin", "content_editor", "catalogue_manager", "order_manager", "membership_manager", "trade_manager", "marketing_manager"];

export default async function StaffPage() {
  const staff = await prisma.staffUser.findMany({ orderBy: { createdAt: "desc" } });
  const rows: GridRow[] = staff.map((u) => ({
    id: u.id, name: u.name ?? "—", email: u.email, role: u.role.replace(/_/g, " "),
    status: u.active ? "active" : "inactive", lastLogin: u.lastLoginAt ? u.lastLoginAt.toISOString() : "",
  }));
  return (
    <>
      <PageHeader
        title="Staff & roles"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Staff" }]}
        subtitle="Invite managers and control what each can edit."
        action={<a href="#invite-staff" className="btn btn-gold btn-sm"><i className="bi bi-person-plus me-1" aria-hidden="true" />New staff</a>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Name", flex: 1.4 }, { field: "email", header: "Email", flex: 1.6 }, { field: "role", header: "Role", width: 170 }, { field: "status", header: "Status", type: "status", width: 120 }, { field: "lastLogin", header: "Last login", type: "date", width: 150 }]}
        nameField="name" editBase="/admin/staff" deleteAction={deleteStaff}
        resultsLabel="staff" quickFilter="Search staff…" exportName="staff"
      />
      <div id="invite-staff" className="mt-4">
        <SectionLabel>Invite</SectionLabel>
        <FormSection
          title="Invite a manager"
          description="Sends a Supabase email invite when SMTP is configured; otherwise creates a pending account you can link later."
          grid={false}
        >
          <form action={inviteStaff} className="row g-3 align-items-end">
            <TextField name="email" label="Email" type="email" required col="col-md-4" />
            <TextField name="name" label="Name" col="col-md-3" />
            <SelectField name="role" label="Role" options={ROLES.map((r) => ({ value: r, label: r.replace(/_/g, " ") }))} col="col-md-3" />
            <div className="col-md-2">
              <button className="btn btn-outline-gold w-100">Send invite</button>
            </div>
          </form>
        </FormSection>
      </div>
    </>
  );
}
