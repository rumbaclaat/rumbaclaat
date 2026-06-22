import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCocktail } from "./actions";

export const dynamic = "force-dynamic";

export default async function CocktailsAdminList() {
  const cocktails = await prisma.cocktail.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <>
      <div className="admin-page-head">
        <h1>Cocktails</h1>
        <Link href="/admin/cocktails/new" className="btn btn-gold btn-sm">+ New cocktail</Link>
      </div>

      <div className="admin-card p-0" style={{ overflow: "hidden" }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Difficulty</th>
                <th>Time</th>
                <th>Status</th>
                <th style={{ width: 1 }}></th>
                <th style={{ width: 1 }}></th>
              </tr>
            </thead>
            <tbody>
              {cocktails.length === 0 && (
                <tr><td colSpan={6} style={{ color: "var(--text-dim)" }}>No cocktails yet.</td></tr>
              )}
              {cocktails.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/admin/cocktails/${c.id}`} className="gold">{c.name}</Link></td>
                  <td style={{ color: "var(--text-muted)" }}>{c.difficulty ?? "—"}</td>
                  <td>{c.timeMins ? `${c.timeMins} min` : "—"}</td>
                  <td style={{ textTransform: "capitalize", color: c.status === "published" ? "var(--green)" : "var(--yellow)" }}>{c.status}</td>
                  <td><Link href={`/cocktails/${c.slug}`} target="_blank" className="btn btn-ghost btn-sm">View ↗</Link></td>
                  <td>
                    <form action={deleteCocktail}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }}>Delete</button>
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
