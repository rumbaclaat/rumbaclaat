import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CocktailForm from "@/components/admin/cocktail-form";
import { updateCocktail } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditCocktailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cocktail, products] = await Promise.all([
    prisma.cocktail.findUnique({ where: { id } }),
    prisma.product.findMany({ where: { type: "rum" }, orderBy: { name: "asc" } }),
  ]);
  if (!cocktail) notFound();

  return (
    <>
      <div className="admin-page-head">
        <h1>Edit cocktail</h1>
      </div>
      <CocktailForm action={updateCocktail} cocktail={cocktail} products={products} submitLabel="Save changes" />
    </>
  );
}
