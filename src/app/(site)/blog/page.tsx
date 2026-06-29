/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog & Stories",
  description: "Stories, craft and cocktail culture from Rumbaclaat.",
};

const CAT_LABELS: Record<string, string> = { Membership: "RPM" };
const catLabel = (c: string | null | undefined) => (c ? CAT_LABELS[c] ?? c : "");

function formatDate(d: Date | null | undefined) {
  return d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";
}

function metaLine(d: Date | null | undefined, readTime: string | null | undefined) {
  const date = formatDate(d);
  if (date && readTime) return `${readTime} · ${date}`;
  return readTime || date || "";
}

export default async function BlogIndex() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { publishDate: "desc" }],
  });

  const [featured, ...rest] = posts;

  return (
    <div data-screen-label="Blog">
      {/* Hero — Storefront Redesign.dc.html ll.436-442 */}
      <section
        style={{
          padding:
            "clamp(44px,6vw,72px) clamp(20px,5vw,40px) clamp(28px,4vw,44px)",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <span
            style={{
              fontSize: ".74rem",
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--gold)",
              fontWeight: 600,
            }}
          >
            Journal
          </span>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "clamp(2.2rem,5vw,3.4rem)",
              lineHeight: 1.05,
              margin: "12px 0 0",
            }}
          >
            Stories &amp; Craft
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              maxWidth: 540,
              margin: "14px 0 0",
            }}
          >
            Heritage, process and culture — the people and patience behind every bottle.
          </p>
        </div>
      </section>

      {/* Posts — Storefront Redesign.dc.html ll.443-468 */}
      <section
        style={{
          padding:
            "clamp(36px,5vw,60px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          {posts.length === 0 ? (
            <p style={{ color: "var(--dim)" }}>No posts yet.</p>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Link
                  href={`/blog/${featured.slug}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: "clamp(24px,4vw,48px)",
                    alignItems: "center",
                    marginBottom: "clamp(40px,5vw,64px)",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      aspectRatio: "16/10",
                      borderRadius: 18,
                      overflow: "hidden",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {featured.heroImage ? (
                      <img
                        src={featured.heroImage}
                        alt={featured.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "var(--surface2)" }} />
                    )}
                  </div>
                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: ".7rem",
                        letterSpacing: ".14em",
                        textTransform: "uppercase",
                        color: "var(--gold)",
                        fontWeight: 600,
                      }}
                    >
                      Featured{featured.category ? ` · ${catLabel(featured.category)}` : ""}
                    </span>
                    <h2
                      style={{
                        fontFamily: "var(--serif)",
                        fontWeight: 600,
                        fontSize: "clamp(1.8rem,3.6vw,2.6rem)",
                        lineHeight: 1.1,
                        margin: "14px 0 0",
                      }}
                    >
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p
                        style={{
                          color: "var(--muted)",
                          fontSize: "1rem",
                          lineHeight: 1.65,
                          margin: "14px 0 0",
                        }}
                      >
                        {featured.excerpt}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        marginTop: 18,
                        color: "var(--dim)",
                        fontSize: ".82rem",
                      }}
                    >
                      {featured.readTime && <>{featured.readTime} <span style={{ opacity: 0.5 }}>·</span> </>}
                      {formatDate(featured.publishDate)}
                    </div>
                  </div>
                </Link>
              )}

              <div
                style={{
                  height: 1,
                  background: "var(--line2)",
                  marginBottom: "clamp(36px,5vw,56px)",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 24,
                }}
              >
                {rest.map((b) => (
                  <Link
                    key={b.id}
                    href={`/blog/${b.slug}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        aspectRatio: "3/2",
                        borderRadius: 14,
                        overflow: "hidden",
                        border: "1px solid var(--line2)",
                        marginBottom: 16,
                      }}
                    >
                      {b.heroImage ? (
                        <img
                          src={b.heroImage}
                          alt={b.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--surface2)" }} />
                      )}
                    </div>
                    {b.category && (
                      <span
                        style={{
                          fontSize: ".7rem",
                          letterSpacing: ".14em",
                          textTransform: "uppercase",
                          color: "var(--gold)",
                        }}
                      >
                        {catLabel(b.category)}
                      </span>
                    )}
                    <h3
                      style={{
                        fontFamily: "var(--serif)",
                        fontWeight: 600,
                        fontSize: "1.35rem",
                        color: "var(--text)",
                        margin: "8px 0 0",
                        lineHeight: 1.2,
                      }}
                    >
                      {b.title}
                    </h3>
                    {b.excerpt && (
                      <p
                        style={{
                          color: "var(--muted)",
                          fontSize: ".88rem",
                          lineHeight: 1.55,
                          margin: "9px 0 0",
                        }}
                      >
                        {b.excerpt}
                      </p>
                    )}
                    <span
                      style={{
                        color: "var(--dim)",
                        fontSize: ".78rem",
                        marginTop: 12,
                      }}
                    >
                      {metaLine(b.publishDate, b.readTime)}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
