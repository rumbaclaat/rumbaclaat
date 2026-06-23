/**
 * Seeds the legal/info pages as editable CMS Pages (hero + rich_text), so the
 * footer links resolve and the copy is editable in Admin → Pages. The bodies
 * are placeholders — paste the finalised policy text in the admin (or port it
 * from static-source/*.html).
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { BlockType } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PAGES: { slug: string; title: string; eyebrow: string; intro: string }[] = [
  { slug: "privacy", title: "Privacy Policy", eyebrow: "Legal", intro: "How we collect, use and protect your personal data (UK GDPR)." },
  { slug: "terms", title: "Terms & Conditions", eyebrow: "Legal", intro: "The terms governing your use of the Rumbaclaat website and purchases." },
  { slug: "cookies", title: "Cookie Policy", eyebrow: "Legal", intro: "How we use cookies and how you can manage your preferences." },
  { slug: "delivery", title: "Delivery Policy", eyebrow: "Help", intro: "UK and international delivery options, timescales and costs." },
  { slug: "where-to-buy", title: "Where to Buy", eyebrow: "Stockists", intro: "Find Rumbaclaat at selected retailers and bars." },
  { slug: "press", title: "Press", eyebrow: "Newsroom", intro: "Press releases, media assets and contact for the Rumbaclaat brand." },
  { slug: "cookie-preferences", title: "Cookie Preferences", eyebrow: "Privacy", intro: "Manage which cookies you allow." },
];

async function main() {
  for (const p of PAGES) {
    const page = await prisma.page.upsert({
      where: { slug: p.slug },
      update: { title: p.title, status: "published", templateType: "legal", seoTitle: `${p.title} — Rumbaclaat` },
      create: { slug: p.slug, title: p.title, status: "published", templateType: "legal", seoTitle: `${p.title} — Rumbaclaat` },
    });

    await prisma.contentBlock.deleteMany({ where: { pageId: page.id } });
    const blocks: { type: BlockType; data: Record<string, string> }[] = [
      { type: "hero_banner", data: { eyebrow: p.eyebrow, heading: p.title, lede: p.intro } },
      { type: "rich_text", data: { html: `<p><em>Placeholder — replace this with your finalised ${p.title.toLowerCase()} in Admin → Pages → ${p.title}.</em></p><p>The reference copy is in <code>static-source/${p.slug}.html</code>.</p>` } },
    ];
    for (let i = 0; i < blocks.length; i++) {
      await prisma.contentBlock.create({ data: { pageId: page.id, type: blocks[i].type, order: i, data: blocks[i].data as object } });
    }
  }
  console.log(`Seeded ${PAGES.length} legal/info pages`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
