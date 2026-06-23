import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 1000 });
  const rows: GridRow[] = logs.map((l) => ({
    id: l.id, when: l.createdAt.toISOString(), staff: l.staffEmail, action: l.action,
    entity: `${l.entityType}${l.entityId ? ` · ${l.entityId.slice(0, 10)}` : ""}`, summary: l.summary ?? "—",
  }));
  return (
    <>
      <PageHeader title="Audit log" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Audit log" }]} subtitle="Every back-office change, newest first." />
      <EntityGrid
        rows={rows}
        columns={[{ field: "when", header: "When", type: "date", width: 160 }, { field: "staff", header: "Staff", flex: 1.2 }, { field: "action", header: "Action", width: 170 }, { field: "entity", header: "Entity", flex: 1.4 }, { field: "summary", header: "Summary", flex: 1.4 }]}
        resultsLabel="entries" quickFilter="Search audit…" exportName="audit-log"
      />
    </>
  );
}
