import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePage } from "./actions";

export const dynamic = "force-dynamic";

export default async function PagesList() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { blocks: true } } },
  });

  return (
    <>
      <div className="admin-page-head">
        <h1>Pages</h1>
        <Link href="/admin/pages/new" className="btn btn-gold btn-sm">
          + New page
        </Link>
      </div>

      <div className="admin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Blocks</th>
                <th>Status</th>
                <th style={{ width: 1 }}></th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ color: "var(--text-dim)" }}>
                    No pages yet — create one to start building with blocks.
                  </td>
                </tr>
              )}
              {pages.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/pages/${p.id}`} className="gold">
                      {p.title}
                    </Link>
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>/{p.slug}</td>
                  <td>{p._count.blocks}</td>
                  <td style={{ textTransform: "capitalize", color: p.status === "published" ? "var(--green)" : "var(--yellow)" }}>
                    {p.status}
                  </td>
                  <td>
                    <Link href={`/${p.slug}`} target="_blank" className="btn btn-ghost btn-sm">
                      View ↗
                    </Link>
                  </td>
                  <td>
                    <form action={deletePage}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }}>
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
