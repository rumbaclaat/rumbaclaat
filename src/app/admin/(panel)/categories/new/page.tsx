import PageHeader from "@/components/admin/ui/page-header";
import CategoryForm from "@/components/admin/category-form";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <>
      <PageHeader
        title="New category"
        subtitle="Create a category to group products on the storefront."
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: "New" },
        ]}
      />
      <CategoryForm action={createCategory} submitLabel="Create category" />
    </>
  );
}
