import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCocktail(slug: string) {
  return prisma.cocktail.findFirst({ where: { slug, status: "published" } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCocktail(slug);
  if (!c) return {};
  return { title: c.name, description: c.lede ?? undefined };
}

export default async function CocktailDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cocktail = await getCocktail(slug);
  if (!cocktail) notFound();

  const ingredients = Array.isArray(cocktail.ingredients) ? (cocktail.ingredients as string[]) : [];
  const method = Array.isArray(cocktail.method) ? (cocktail.method as string[]) : [];
  const serviceNotes =
    cocktail.serviceNotes && typeof cocktail.serviceNotes === "object" && !Array.isArray(cocktail.serviceNotes)
      ? (cocktail.serviceNotes as Record<string, string>)
      : {};

  const featured = cocktail.featuredProductId
    ? await prisma.product.findUnique({ where: { id: cocktail.featuredProductId } })
    : null;

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 980 }}>
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="breadcrumb" style={{ fontSize: ".75rem" }}>
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/cocktails">Cocktails</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{cocktail.name}</li>
          </ol>
        </nav>

        <div className="row g-5">
          <div className="col-12 col-lg-5">
            <div style={{ aspectRatio: "3/4", borderRadius: "var(--radius-xl)", background: "var(--bg-card2)", border: "1px solid var(--gold-bdr)", backgroundImage: cocktail.image ? `url('${cocktail.image}')` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
          </div>

          <div className="col-12 col-lg-7">
            {cocktail.eyebrow && <span className="eyebrow">{cocktail.eyebrow}</span>}
            <h1>{cocktail.name}</h1>
            {cocktail.lede && <p className="hero-lede" style={{ margin: "10px 0 0" }}>{cocktail.lede}</p>}

            <div className="d-flex gap-2 flex-wrap mt-3">
              {cocktail.difficulty && <span className="badge-brand">{cocktail.difficulty}</span>}
              {cocktail.timeMins && <span className="badge-brand">{cocktail.timeMins} mins</span>}
              {cocktail.occasion && <span className="badge-brand">{cocktail.occasion}</span>}
            </div>

            {ingredients.length > 0 && (
              <div className="mt-4">
                <h2 className="h5">Ingredients</h2>
                <ul style={{ color: "var(--text-muted)" }}>
                  {ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
            )}

            {Object.keys(serviceNotes).length > 0 && (
              <div className="row g-2 mt-1">
                {Object.entries(serviceNotes).map(([k, v]) => (
                  <div className="col-6 col-md-3" key={k}>
                    <div className="card-brand" style={{ padding: 12 }}>
                      <div style={{ fontSize: ".625rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".08em" }}>{k}</div>
                      <div style={{ fontSize: ".8125rem" }}>{v}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {method.length > 0 && (
          <div className="mt-5">
            <h2 className="h4 mb-3">Method</h2>
            <ol style={{ color: "var(--text-muted)", maxWidth: 680 }}>
              {method.map((step, i) => <li key={i} style={{ marginBottom: 8 }}>{step}</li>)}
            </ol>
          </div>
        )}

        {cocktail.bartenderTip && (
          <div className="card-brand mt-4" style={{ maxWidth: 680 }}>
            <span className="eyebrow">Bartender tip</span>
            <p style={{ color: "var(--text-muted)", margin: 0 }}>{cocktail.bartenderTip}</p>
          </div>
        )}

        {featured && (
          <div className="mt-4">
            <Link href={`/product/${featured.slug}`} className="btn btn-gold">
              Shop {featured.name} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
