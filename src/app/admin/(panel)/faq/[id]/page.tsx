import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { updateFaq } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditFaq({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await prisma.fAQItem.findUnique({ where: { id } });
  if (!f) notFound();
  return (
    <>
      <PageHeader title="Edit question" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "FAQ", href: "/admin/faq" }, { label: f.question.slice(0, 32) }]} />
      <form action={updateFaq} style={{ maxWidth: 720 }}>
        <input type="hidden" name="id" value={f.id} />
        <FormSection title="Question">
          <div className="col-md-4"><label className="form-label" htmlFor="category">Category</label><input id="category" name="category" className="form-control" defaultValue={f.category ?? ""} /></div>
          <div className="col-12"><label className="form-label" htmlFor="question">Question</label><input id="question" name="question" className="form-control" defaultValue={f.question} required /></div>
          <div className="col-12"><label className="form-label" htmlFor="answer">Answer</label><textarea id="answer" name="answer" rows={4} className="form-control" defaultValue={f.answer} required /></div>
        </FormSection>
        <SaveBar submitLabel="Save changes" cancelHref="/admin/faq" />
      </form>
    </>
  );
}
