/** Seeds an example "About" page built from content blocks (idempotent). */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { BlockType } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BLOCKS: { type: BlockType; data: Record<string, string | number> }[] = [
  {
    type: "hero_banner",
    data: {
      eyebrow: "Our story",
      heading: "Born in the Caribbean. Bottled for the Bold.",
      lede: "From the canefields of Jamaica to your glass — a tribute to Caribbean culture, distilled into every drop.",
      ctaLabel: "Shop Rum",
      ctaUrl: "/shop",
      cta2Label: "Join the Inner Circle",
      cta2Url: "/join",
    },
  },
  {
    type: "stat_block",
    data: {
      heading: "By the numbers",
      stats: "50K+ | Members\n12+ | Years aged\n40+ | Countries\n18+ | Awards",
    },
  },
  {
    type: "two_col",
    data: {
      heading: "Aged in American oak",
      body: "<p>Twelve years minimum. Caribbean heat accelerates maturation — one year in Trinidad is worth three in Scotland. Patience is the secret ingredient.</p>",
      imageSide: "right",
    },
  },
  { type: "membership_tiers", data: { heading: "The Inner Circle of Rum" } },
  {
    type: "cta_band",
    data: {
      heading: "Join for free. Upgrade when ready.",
      body: "Bronze membership is permanently free. No card. No commitment.",
      ctaLabel: "Join free",
      ctaUrl: "/join",
    },
  },
];

async function main() {
  const page = await prisma.page.upsert({
    where: { slug: "about" },
    update: {
      title: "About Rumbaclaat",
      status: "published",
      seoTitle: "About — Rumbaclaat",
      seoDescription: "The story behind Rumbaclaat premium Caribbean rum.",
    },
    create: {
      slug: "about",
      title: "About Rumbaclaat",
      templateType: "content",
      status: "published",
      seoTitle: "About — Rumbaclaat",
      seoDescription: "The story behind Rumbaclaat premium Caribbean rum.",
    },
  });

  await prisma.contentBlock.deleteMany({ where: { pageId: page.id } });
  for (let i = 0; i < BLOCKS.length; i++) {
    await prisma.contentBlock.create({
      data: {
        pageId: page.id,
        type: BLOCKS[i].type,
        order: i,
        data: BLOCKS[i].data as object,
      },
    });
  }

  console.log(`Seeded "about" page with ${BLOCKS.length} blocks → /about`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
