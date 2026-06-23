import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import AdminCard from "@/components/admin/ui/admin-card";
import EntityGrid, { type GridRow } from "@/components/admin/grid/entity-grid";
import { createFaq, deleteFaq, reorderFaq } from "./actions";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const items = await prisma.fAQItem.findMany({ orderBy: { sortOrder: "asc" } });
  const rows: GridRow[] = items.map((f) => ({ id: f.id, question: f.question, category: f.category ?? "—" }));
  return (
    <>
      <PageHeader title="FAQ" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "FAQ" }]} />
      <EntityGrid
        rows={rows}
        columns={[{ field: "question", header: "Question", flex: 2.6 }, { field: "category", header: "Category", width: 160 }]}
        nameField="question" editBase="/admin/faq" deleteAction={deleteFaq} reorderAction={reorderFaq}
        resultsLabel="questions" quickFilter="Search FAQ…" exportName="faq"
      />
      <AdminCard title="Add question" className="mt-4">
        <form action={createFaq} className="row g-2 align-items-end">
          <div className="col-md-3"><label className="form-label" htmlFor="fc">Category</label><input id="fc" name="category" className="form-control form-control-sm" placeholder="Delivery" /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="fq">Question</label><input id="fq" name="question" className="form-control form-control-sm" required /></div>
          <div className="col-md-4"><label className="form-label" htmlFor="fa">Answer</label><input id="fa" name="answer" className="form-control form-control-sm" required /></div>
          <div className="col-md-1"><button className="btn btn-gold btn-sm w-100">Add</button></div>
        </form>
      </AdminCard>
    </>
  );
}
