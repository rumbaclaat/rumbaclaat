import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteStaff } from "./actions";

export const dynamic = "force-dynamic";

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
        action={<Link href="/admin/staff/new" className="btn btn-gold btn-sm"><i className="bi bi-person-plus me-1" aria-hidden="true" />New staff</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "name", header: "Name", flex: 1.4 }, { field: "email", header: "Email", flex: 1.6 }, { field: "role", header: "Role", width: 170 }, { field: "status", header: "Status", type: "status", width: 120 }, { field: "lastLogin", header: "Last login", type: "date", width: 150 }]}
        nameField="name" editBase="/admin/staff" deleteAction={deleteStaff}
        resultsLabel="staff" quickFilter="Search staff…" exportName="staff"
      />
    </>
  );
}
