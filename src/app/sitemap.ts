import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE = "https://rumbaclaat.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [pages, products, posts, cocktails] = await Promise.all([
      prisma.page.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
      prisma.product.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
      prisma.cocktail.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    ]);
    return [
      { url: BASE, lastModified: new Date(), priority: 1 },
      { url: `${BASE}/shop`, lastModified: new Date(), priority: 0.9 },
      ...pages.filter((p) => p.slug !== "home").map((p) => ({ url: `${BASE}/${p.slug}`, lastModified: p.updatedAt })),
      ...products.map((p) => ({ url: `${BASE}/product/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
      ...posts.map((p) => ({ url: `${BASE}/blog/${p.slug}`, lastModified: p.updatedAt })),
      ...cocktails.map((c) => ({ url: `${BASE}/cocktails/${c.slug}`, lastModified: c.updatedAt })),
    ];
  } catch {
    return [{ url: BASE, lastModified: new Date() }];
  }
}
