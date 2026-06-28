import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";
import { TextField } from "@/components/admin/ui/field";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader
        title="New customer"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: "New" }]}
      />
      <form action={createCustomer}>
        <div className="admin-product-grid">
          <div className="admin-product-main">
            <FormSection title="Details">
              <TextField name="email" label="Email" type="email" required col="col-12" />
              <TextField name="firstName" label="First name" col="col-md-6" />
              <TextField name="lastName" label="Last name" col="col-md-6" />
              <TextField name="phone" label="Phone" col="col-md-6" />
            </FormSection>
          </div>

          <div className="admin-product-rail">
            <FormSection title="Membership">
              <p className="admin-form-section-desc" style={{ margin: 0 }}>
                Tier, points and marketing preferences become available once the customer is created.
              </p>
            </FormSection>
          </div>
        </div>

        <SaveBar submitLabel="Create customer" cancelHref="/admin/customers" />
      </form>
    </>
  );
}
