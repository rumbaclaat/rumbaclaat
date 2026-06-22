import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/admin/category-form";
import { updateCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <>
      <div className="admin-page-head">
        <h1>Edit category</h1>
      </div>
      <CategoryForm
        action={updateCategory}
        category={category}
        submitLabel="Save changes"
      />
    </>
  );
}
