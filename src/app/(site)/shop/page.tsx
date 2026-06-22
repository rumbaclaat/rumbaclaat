import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop",
  description: "Shop Rumbaclaat rum, apparel and gift cards. 18+ only.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: {
        status: "published",
        ...(category ? { category: { slug: category } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
  ]);

  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-5">
          <span className="eyebrow">Shop</span>
          <h1>The Collection</h1>
        </div>

        {/* Category filter */}
        <div className="d-flex gap-2 justify-content-center flex-wrap mb-5">
          <Link
            href="/shop"
            className={`btn btn-sm ${!category ? "btn-gold" : "btn-outline-gold"}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className={`btn btn-sm ${category === c.slug ? "btn-gold" : "btn-outline-gold"}`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="text-center" style={{ color: "var(--text-dim)" }}>
            No products found.
          </p>
        ) : (
          <div className="row g-4">
            {products.map((p) => (
              <div className="col-6 col-md-4 col-lg-3" key={p.id}>
                <Link
                  href={`/product/${p.slug}`}
                  className="card-brand d-block h-100 text-decoration-none"
                >
                  <div
                    style={{
                      aspectRatio: "1",
                      borderRadius: "var(--radius)",
                      background: "var(--bg-card3)",
                      marginBottom: 12,
                    }}
                  />
                  <p style={{ fontSize: ".6875rem", color: "var(--text-dim)", margin: 0 }}>
                    {p.category?.name}
                  </p>
                  <h3 className="h6" style={{ color: "var(--text)", margin: "2px 0 6px" }}>
                    {p.name}
                  </h3>
                  <div className="d-flex align-items-baseline gap-2">
                    {p.onSale && p.salePrice != null ? (
                      <>
                        <span className="serif gold" style={{ fontSize: "1.15rem" }}>
                          £{Number(p.salePrice).toFixed(2)}
                        </span>
                        <span style={{ color: "var(--text-dim)", textDecoration: "line-through", fontSize: ".8125rem" }}>
                          £{Number(p.basePrice).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="serif gold" style={{ fontSize: "1.15rem" }}>
                        £{Number(p.basePrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
