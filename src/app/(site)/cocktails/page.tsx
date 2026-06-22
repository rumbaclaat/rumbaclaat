import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cocktails",
  description: "Cocktail recipes built around Rumbaclaat rum.",
};

export default async function CocktailsIndex() {
  const cocktails = await prisma.cocktail.findMany({
    where: { status: "published" },
    orderBy: { name: "asc" },
  });

  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-5">
          <span className="eyebrow">Cocktail recipes</span>
          <h1>Mix it up</h1>
        </div>

        {cocktails.length === 0 ? (
          <p className="text-center" style={{ color: "var(--text-dim)" }}>No recipes yet.</p>
        ) : (
          <div className="row g-4">
            {cocktails.map((c) => (
              <div className="col-12 col-md-4" key={c.id}>
                <Link href={`/cocktails/${c.slug}`} className="card-brand d-block h-100 text-decoration-none">
                  <div style={{ aspectRatio: "3/4", borderRadius: "var(--radius)", background: "var(--bg-card3)", marginBottom: 12, backgroundImage: c.image ? `url('${c.image}')` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
                  {(c.difficulty || c.timeMins) && (
                    <span className="badge-brand mb-2">
                      {c.difficulty}{c.difficulty && c.timeMins ? " · " : ""}{c.timeMins ? `${c.timeMins} mins` : ""}
                    </span>
                  )}
                  <h2 className="h5" style={{ color: "var(--text)" }}>{c.name}</h2>
                  {c.lede && <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", margin: 0 }}>{c.lede}</p>}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
