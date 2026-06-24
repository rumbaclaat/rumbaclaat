import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { createFaq } from "../actions";

export default function NewFaq() {
  return (
    <>
      <PageHeader title="New question" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "FAQ", href: "/admin/faq" }, { label: "New" }]} />
      <form action={createFaq} style={{ maxWidth: 720 }}>
        <FormSection title="Question">
          <div className="col-md-4"><label className="form-label" htmlFor="category">Category</label><input id="category" name="category" className="form-control" placeholder="Delivery" /></div>
          <div className="col-12"><label className="form-label" htmlFor="question">Question</label><input id="question" name="question" className="form-control" required /></div>
          <div className="col-12"><label className="form-label" htmlFor="answer">Answer</label><textarea id="answer" name="answer" rows={4} className="form-control" required /></div>
        </FormSection>
        <SaveBar submitLabel="Create question" cancelHref="/admin/faq" />
      </form>
    </>
  );
}
