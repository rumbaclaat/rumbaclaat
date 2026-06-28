import type { FAQItem } from "@/generated/prisma/client";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField, TextareaField } from "@/components/admin/ui/field";

export default function FaqForm({
  action,
  faq,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  faq?: FAQItem;
  submitLabel: string;
}) {
  return (
    <form action={action}>
      {faq && <input type="hidden" name="id" value={faq.id} />}

      <div className="admin-product-grid">
        {/* Main column */}
        <div className="admin-product-main">
          <FormSection title="Question">
            <TextField name="question" label="Question" defaultValue={faq?.question ?? ""} required col="col-12" />
            <TextareaField name="answer" label="Answer" defaultValue={faq?.answer ?? ""} rows={4} required />
          </FormSection>
        </div>

        {/* Persistent rail */}
        <div className="admin-product-rail">
          <FormSection title="Organisation">
            <TextField name="category" label="Category" defaultValue={faq?.category ?? ""} col="col-12" placeholder="Delivery" />
          </FormSection>
        </div>
      </div>

      <SaveBar submitLabel={submitLabel} cancelHref="/admin/faq" />
    </form>
  );
}
