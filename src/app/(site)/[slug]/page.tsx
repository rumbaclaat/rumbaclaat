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
    <>
      {page.blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </>
  );
}
