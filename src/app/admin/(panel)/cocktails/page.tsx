import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCocktail } from "./actions";
import PageHeader from "@/components/admin/ui/page-header";
import CocktailsGrid, { type CocktailRow } from "@/components/admin/cocktails/cocktails-grid";

export const dynamic = "force-dynamic";

export default async function CocktailsAdminList() {
  const cocktails = await prisma.cocktail.findMany({ orderBy: { updatedAt: "desc" } });
  const rows: CocktailRow[] = cocktails.map((c) => ({
    id: c.id, name: c.name, slug: c.slug, difficulty: c.difficulty ?? "—", time: c.timeMins ? `${c.timeMins} min` : "—", status: c.status,
  }));
  return (
    <>
      <PageHeader
        title="Cocktails"
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Cocktails" }]}
        action={<Link href="/admin/cocktails/new" className="btn btn-gold btn-sm"><i className="bi bi-plus-lg me-1" aria-hidden="true" />New cocktail</Link>}
      />
      <CocktailsGrid rows={rows} deleteAction={deleteCocktail} />
    </>
  );
}
