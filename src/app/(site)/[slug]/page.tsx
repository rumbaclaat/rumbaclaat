import type { Metadata } from "next";
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
    <section className="section">
      <div className="container">
        <header style={{ maxWidth: 820, marginInline: "auto", textAlign: "center", marginBottom: "clamp(36px, 5vw, 56px)" }}>
          <span className="eyebrow eyebrow-center">Rumbaclaat</span>
          <h1 className="serif" style={{ fontSize: "clamp(2rem, 4.4vw, 3.4rem)", margin: 0 }}>
            {page.title}
          </h1>
        </header>
        <div style={{ maxWidth: 820, marginInline: "auto" }}>
          {page.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      </div>
    </section>
  );
}
