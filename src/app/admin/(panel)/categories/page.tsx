import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <>
      <div className="admin-page-head">
        <h1>Categories</h1>
        <Link href="/admin/categories/new" className="btn btn-gold btn-sm">
          + New category
        </Link>
      </div>

      <div className="admin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Order</th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--text-dim)" }}>
                    No categories yet.
                  </td>
                </tr>
              )}
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/categories/${c.id}`} className="gold">
                      {c.name}
                    </Link>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{c.slug}</td>
                  <td>{c._count.products}</td>
                  <td>{c.sortOrder}</td>
                  <td>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button
                        type="submit"
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--red)" }}
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
