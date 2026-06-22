import CategoryForm from "@/components/admin/category-form";
import { createCategory } from "../actions";

export default function NewCategoryPage() {
  return (
    <>
      <div className="admin-page-head">
        <h1>New category</h1>
      </div>
      <CategoryForm action={createCategory} submitLabel="Create category" />
    </>
  );
}
