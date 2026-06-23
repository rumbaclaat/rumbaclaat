import Link from "next/link";
import { createPage } from "../actions";
import PageHeader from "@/components/admin/ui/page-header";
import FormSection from "@/components/admin/ui/form-section";
import { TextField, SelectField } from "@/components/admin/ui/field";

export default function NewPagePage() {
  return (
    <>
      <PageHeader
        title="New page"
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: "New page" },
        ]}
      />
      <form action={createPage} style={{ maxWidth: 680 }}>
        <FormSection title="Page details">
          <TextField name="title" label="Title" required col="col-sm-8" />
          <SelectField name="status" label="Status" options={["draft", "published"]} defaultValue="draft" col="col-sm-4" />
          <TextField name="slug" label="Slug" placeholder="about" col="col-12" hint="Leave blank to auto-generate from the title." />
        </FormSection>
        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-gold">Create &amp; add blocks</button>
          <Link href="/admin/pages" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </>
  );
}
