import { prisma } from "@/lib/prisma";
import CocktailForm from "@/components/admin/cocktail-form";
import PageHeader from "@/components/admin/ui/page-header";
import { createCocktail } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCocktailPage() {
  const products = await prisma.product.findMany({
    where: { type: "rum" },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <PageHeader
        title="New cocktail"
        subtitle="Add a recipe to the cocktail library."
        breadcrumb={[{ label: "Dashboard", href: "/admin" }, { label: "Cocktails", href: "/admin/cocktails" }, { label: "New" }]}
      />
      <CocktailForm action={createCocktail} products={products} submitLabel="Create cocktail" />
    </>
  );
}
