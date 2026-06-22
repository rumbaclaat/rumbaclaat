import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog & Stories",
  description: "Stories, craft and cocktail culture from Rumbaclaat.",
};

export default async function BlogIndex() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { publishDate: "desc" }],
  });

  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-5">
          <span className="eyebrow">From the blog</span>
          <h1>Stories &amp; Craft</h1>
        </div>

        {posts.length === 0 ? (
          <p className="text-center" style={{ color: "var(--text-dim)" }}>No posts yet.</p>
        ) : (
          <div className="row g-4">
            {posts.map((p) => (
              <div className="col-12 col-md-6 col-lg-4" key={p.id}>
                <Link href={`/blog/${p.slug}`} className="card-brand d-block h-100 text-decoration-none">
                  <div style={{ aspectRatio: "16/9", borderRadius: "var(--radius)", background: "var(--bg-card3)", marginBottom: 12, backgroundImage: p.heroImage ? `url('${p.heroImage}')` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
                  {p.category && <span className="badge-brand mb-2">{p.category}</span>}
                  <h2 className="h6" style={{ color: "var(--text)" }}>{p.title}</h2>
                  {p.excerpt && <p style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>{p.excerpt}</p>}
                  <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: 0 }}>
                    {p.publishDate ? new Date(p.publishDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    {p.readTime ? ` · ${p.readTime}` : ""}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
