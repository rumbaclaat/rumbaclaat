import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { deleteFaq, reorderFaq } from "./actions";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const items = await prisma.fAQItem.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((f) => ({ id: f.id, question: f.question, category: f.category ?? "—" }));
  return (
    <>
      <PageHeader
        title="FAQ"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "FAQ" }]}
        action={<Link href="/admin/faq/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New question</Link>}
      />
      <EntityGrid
        rows={rows}
        columns={[{ field: "question", header: "Question", flex: 2.6 }, { field: "category", header: "Category", width: 160 }]}
        nameField="question" editBase="/admin/faq" deleteAction={deleteFaq} reorderAction={reorderFaq}
        resultsLabel="questions" quickFilter="Search FAQ…" exportName="faq"
      />
    </>
  );
}
