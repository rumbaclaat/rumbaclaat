import { prisma } from "@/lib/prisma";
import CocktailForm from "@/components/admin/cocktail-form";
import { createCocktail } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCocktailPage() {
  const products = await prisma.product.findMany({
    where: { type: "rum" },
    orderBy: { name: "asc" },
  });
  return (
    <>
      <div className="admin-page-head">
        <h1>New cocktail</h1>
      </div>
      <CocktailForm action={createCocktail} products={products} submitLabel="Create cocktail" />
    </>
  );
}
