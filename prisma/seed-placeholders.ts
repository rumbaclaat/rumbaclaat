/** Surfaces the storefront's current placeholder images into the admin: writes
 *  the Unsplash URLs the design uses onto the matching DB records, but ONLY
 *  where the field is empty (so it never overwrites images you've set). Re-runs
 *  safely. `npm run db:seed-placeholders`. */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const U = (id: string, w = 1000) => `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=${w}`;

const RUM = U("photo-1758871993077-e084cc7eca86");
const MENS = U("photo-1770795263454-2756f5d7d9b0");
const WOMENS = U("photo-1643302213971-0f21b7ada420");

const PRODUCT_BY_CAT: Record<string, string> = { rum: RUM, "mens-apparel": MENS, "womens-apparel": WOMENS };
const CATEGORY_IMG: Record<string, string> = { rum: RUM, "mens-apparel": MENS, "womens-apparel": WOMENS };
const BLOG_IMG: Record<string, string> = {
  "the-story-behind-rumbaclaat": U("photo-1642963036562-affa2703f5ad"),
  "the-art-of-rum-ageing": U("photo-1764699186296-9dac0ddb5edb"),
  "cocktail-culture-in-2025": U("photo-1767745455688-49391131f751"),
};
const COCKTAIL_IMG: Record<string, string> = {
  "rumbaclaat-sour": U("photo-1748674755168-266c309d4712"),
  "spiced-mule": U("photo-1609189123897-42db027571c9"),
};

async function main() {
  // Products — fill empty imageUrl/gallery by category (fallback by type)
  const products = await prisma.product.findMany({ include: { category: true } });
  let pCount = 0;
  for (const p of products) {
    if (p.imageUrl) continue;
    let img = p.category ? PRODUCT_BY_CAT[p.category.slug] : undefined;
    if (!img) img = p.type === "rum" ? RUM : p.type === "gift_card" ? "" : MENS;
    if (!img) continue;
    await prisma.product.update({ where: { id: p.id }, data: { imageUrl: img, galleryImages: p.galleryImages.length ? p.galleryImages : [img] } });
    pCount++;
  }

  // Categories / Blog / Cocktails — only where empty
  for (const [slug, img] of Object.entries(CATEGORY_IMG)) await prisma.category.updateMany({ where: { slug, heroImage: null }, data: { heroImage: img } });
  for (const [slug, img] of Object.entries(BLOG_IMG)) await prisma.blogPost.updateMany({ where: { slug, heroImage: null }, data: { heroImage: img } });
  for (const [slug, img] of Object.entries(COCKTAIL_IMG)) await prisma.cocktail.updateMany({ where: { slug, image: null }, data: { image: img } });

  // Home page hero block background
  const home = await prisma.page.findUnique({ where: { slug: "home" }, include: { blocks: true } });
  const hero = home?.blocks.find((b) => b.type === "hero_banner");
  if (hero) {
    const data = hero.data as Record<string, unknown>;
    if (!data.backgroundImage) {
      await prisma.contentBlock.update({ where: { id: hero.id }, data: { data: { ...data, backgroundImage: U("photo-1758871993077-e084cc7eca86", 1800) } as Prisma.InputJsonObject } });
    }
  }

  console.log(`Placeholder images surfaced: ${pCount} products + categories/blog/cocktails + home hero.`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
