import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { issueGiftCard } from "../actions";

export default function NewGiftCard() {
  return (
    <>
      <PageHeader title="Issue gift card" breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Gift cards", href: "/admin/gift-cards" }, { label: "Issue" }]} />
      <form action={issueGiftCard} style={{ maxWidth: 680 }}>
        <FormSection title="Gift card">
          <div className="col-md-4"><label className="form-label" htmlFor="amount">Amount (£)</label><input id="amount" name="amount" type="number" step="0.01" className="form-control" defaultValue="25" required /></div>
          <div className="col-md-8"><label className="form-label" htmlFor="recipient">Recipient</label><input id="recipient" name="recipient" className="form-control" /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="sender">Sender</label><input id="sender" name="sender" className="form-control" /></div>
          <div className="col-md-6"><label className="form-label" htmlFor="message">Message</label><input id="message" name="message" className="form-control" /></div>
        </FormSection>
        <SaveBar submitLabel="Issue gift card" cancelHref="/admin/gift-cards" />
      </form>
    </>
  );
}
