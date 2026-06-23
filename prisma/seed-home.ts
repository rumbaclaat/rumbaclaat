/** Seeds an editable draft "home" page (idempotent). Publish it in the admin to
 *  take over the storefront homepage; until then the hand-built home stays live. */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import type { BlockType } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const existing = await prisma.page.findUnique({ where: { slug: "home" } });
  if (existing) {
    console.log("Home page already exists — leaving it untouched.");
    return;
  }
  const page = await prisma.page.create({
    data: { slug: "home", templateType: "homepage", title: "Home", status: "draft", seoTitle: "Rumbaclaat — Premium Caribbean Rum" },
  });
  const blocks: { type: BlockType; data: Prisma.InputJsonObject }[] = [
    { type: "hero_banner", data: { eyebrow: "Premium Caribbean Rum", heading: "Born in the Caribbean. Bottled for the Bold.", lede: "Aged in American oak. Crafted with heritage. Rumbaclaat rum is a tribute to Caribbean culture, distilled into every drop.", ctaLabel: "Shop Rum", ctaUrl: "/shop", cta2Label: "Join the Inner Circle", cta2Url: "/join", backgroundImage: "" } },
    { type: "trust_bar", data: { items: "Free UK shipping over £50\n18+ aged & verified\nSmall-batch craft\nSecure checkout" } },
    { type: "featured_products", data: { heading: "House selection", limit: 3 } },
    { type: "membership_tiers", data: { heading: "Join the Inner Circle" } },
    { type: "newsletter", data: { eyebrow: "Stay in the loop", heading: "Get drop alerts & cocktail recipes", body: "No spam — just good rum and the occasional recipe." } },
  ];
  for (let i = 0; i < blocks.length; i++) {
    await prisma.contentBlock.create({ data: { pageId: page.id, type: blocks[i].type, order: i, data: blocks[i].data } });
  }
  console.log(`Seeded draft "home" page with ${blocks.length} blocks.`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
