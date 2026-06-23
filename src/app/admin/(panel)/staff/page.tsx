import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
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
      <PageHeader title="Staff & roles" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Staff" }]} subtitle="Invite managers and control what each can edit." />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Name", flex: 1.4 }, { field: "email", header: "Email", flex: 1.6 }, { field: "role", header: "Role", width: 170 }, { field: "status", header: "Status", type: "status", width: 120 }, { field: "lastLogin", header: "Last login", type: "date", width: 150 }]}
        nameField="name" editBase="/admin/staff" deleteAction={deleteStaff}
        resultsLabel="staff" quickFilter="Search staff…" exportName="staff"
      />
      <AdminCard title="Invite a manager" className="mt-4">
        <form action={inviteStaff} className="row g-2 align-items-end">
          <div className="col-md-4"><label className="form-label" htmlFor="ie">Email</label><input id="ie" name="email" type="email" className="form-control form-control-sm" required /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="in">Name</label><input id="in" name="name" className="form-control form-control-sm" /></div>
          <div className="col-md-3"><label className="form-label" htmlFor="ir">Role</label><select id="ir" name="role" className="form-select form-select-sm">{ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}</select></div>
          <div className="col-md-2"><button className="btn btn-gold btn-sm w-100">Send invite</button></div>
        </form>
        <p className="td-muted mt-2 mb-0" style={{ fontSize: ".78rem" }}>Sends a Supabase email invite when SMTP is configured; otherwise creates a pending account you can link later.</p>
      </AdminCard>
    </>
  );
}
