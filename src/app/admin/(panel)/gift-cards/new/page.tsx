import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField, TextareaField } from "@/components/admin/ui/field";
import { issueGiftCard } from "../actions";

export default function NewGiftCard() {
  return (
    <>
      <PageHeader title="Issue gift card" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Gift cards", href: "/admin/gift-cards" }, { label: "Issue" }]} />
      <form action={issueGiftCard}>
        <div className="admin-product-grid">
          <div className="admin-product-main">
            <FormSection title="Card">
              <TextField name="recipient" label="Recipient" col="col-md-6" />
              <TextField name="sender" label="Sender" col="col-md-6" />
              <TextareaField name="message" label="Message" rows={3} />
            </FormSection>
          </div>

          <div className="admin-product-rail">
            <FormSection title="Options">
              <TextField name="amount" label="Amount (£)" type="number" step="0.01" defaultValue="25" required col="col-12" />
            </FormSection>
          </div>
        </div>

        <SaveBar submitLabel="Issue gift card" cancelHref="/admin/gift-cards" />
      </form>
    </>
  );
}
