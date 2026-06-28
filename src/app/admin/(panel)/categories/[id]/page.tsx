import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/admin/ui/page-header";
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
      <PageHeader
        title="Edit category"
        subtitle="Update the category details, slug and ordering."
        breadcrumb={[
          { label: "Dashboard", href: "/admin" },
          { label: "Categories", href: "/admin/categories" },
          { label: category.name },
        ]}
      />
      <CategoryForm
        action={updateCategory}
        category={category}
        submitLabel="Save changes"
      />
    </>
  );
}
