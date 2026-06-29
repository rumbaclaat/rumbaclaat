import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BlockRenderer from "@/components/blocks/block-renderer";

export const dynamic = "force-dynamic";

async function getPage(slug: string) {
  return prisma.page.findFirst({
    where: { slug, status: "published" },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? undefined,
    robots: page.robots ?? undefined,
    openGraph: page.ogImage ? { images: [page.ogImage] } : undefined,
    alternates: page.canonical ? { canonical: page.canonical } : undefined,
  };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div data-screen-label="Policy">
      <section style={{ padding: "clamp(40px,5vw,64px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: ".78rem", color: "var(--dim)", marginBottom: 22 }}>
            <Link href="/" style={{ color: "var(--dim)" }}>
              Home
            </Link>{" "}
            <span style={{ opacity: 0.5 }}>/</span>{" "}
            <span style={{ color: "var(--muted)" }}>{page.title}</span>
          </div>
          <div style={{ marginBottom: 36 }}>
            <span
              style={{
                fontSize: ".74rem",
                letterSpacing: ".24em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 600,
              }}
            >
              Legal
            </span>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 600,
                fontSize: "clamp(2rem,4.4vw,3rem)",
                lineHeight: 1.05,
                margin: "12px 0 0",
              }}
            >
              {page.title}
            </h1>
          </div>
          <div
            style={{
              maxWidth: 680,
              background: "var(--surface)",
              border: "1px solid var(--line2)",
              borderRadius: 12,
              padding: "clamp(24px,4vw,40px)",
            }}
          >
            {page.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
