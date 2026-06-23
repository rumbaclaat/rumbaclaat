import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EnquiriesGrid, { type EnquiryRow } from "@/components/admin/enquiries/enquiries-grid";

export const dynamic = "force-dynamic";

export default async function EnquiriesPage() {
  const enquiries = await prisma.contactEnquiry.findMany({ orderBy: { createdAt: "desc" } });

  const rows: EnquiryRow[] = enquiries.map((e) => ({
    id: e.id,
    type: e.type,
    name: e.name,
    email: e.email,
    subject: e.subject ?? "—",
    status: e.status,
    received: e.createdAt.toISOString(),
  }));

  return (
    <>
      <PageHeader title="Enquiries" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Enquiries" }]} />
      <EnquiriesGrid rows={rows} />
    </>
  );
}
