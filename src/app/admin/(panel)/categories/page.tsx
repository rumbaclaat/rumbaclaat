import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "./actions";
import PageHeader from "@/components/admin/ui/page-header";
import CategoriesGrid, { type CategoryRow } from "@/components/admin/categories/categories-grid";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const rows: CategoryRow[] = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, products: c._count.products, order: c.sortOrder }));
  return (
    <>
      <PageHeader
        title="Categories"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Categories" }]}
        action={<Link href="/admin/categories/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New category</Link>}
      />
      <CategoriesGrid rows={rows} deleteAction={deleteCategory} />
    </>
  );
}
