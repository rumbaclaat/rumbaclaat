import Link from "next/link";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import { TextField } from "@/components/admin/ui/field";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader
        title="New customer"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: "New" }]}
      />
      <form action={createCustomer} style={{ maxWidth: 680 }}>
        <FormSection title="Details">
          <TextField name="email" label="Email" type="email" required col="col-12" />
          <TextField name="firstName" label="First name" col="col-md-6" />
          <TextField name="lastName" label="Last name" col="col-md-6" />
          <TextField name="phone" label="Phone" col="col-md-6" />
        </FormSection>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-gold">Create customer</button>
          <Link href="/admin/customers" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </>
  );
}
