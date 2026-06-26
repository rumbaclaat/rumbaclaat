/** Backfills rich example content into the editor areas so every form looks
 *  populated — but ONLY where a field is empty, so it never overwrites real
 *  content. Re-runs safely. Run: `npm run db:seed-dummy`. */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const isEmptyArr = (v: unknown) => !Array.isArray(v) || v.length === 0;
const isEmptyObj = (v: unknown) => !v || typeof v !== "object" || Object.keys(v as object).length === 0;

async function seedCocktails() {
  const cocktails = await prisma.cocktail.findMany();
  let n = 0;
  for (const c of cocktails) {
    const data: Prisma.CocktailUpdateInput = {};
    if (!c.eyebrow) data.eyebrow = "Signature serve";
    if (!c.occasion) data.occasion = "Evening · Any occasion";
    if (!c.lede) data.lede = `${c.name} — a rum-forward classic, balanced and easy to build at home.`;
    if (isEmptyArr(c.ingredients)) data.ingredients = ["50ml Rumbaclaat rum", "25ml fresh lime juice", "15ml sugar syrup", "Ice", "Garnish of choice"];
    if (isEmptyArr(c.method)) data.method = ["Add the rum, lime and syrup to a shaker with ice", "Shake hard for 10–12 seconds", "Strain into a chilled glass", "Add the garnish and serve"];
    if (isEmptyObj(c.serviceNotes)) data.serviceNotes = { Glassware: "Coupe", Garnish: "Lime twist", "Total time": `${c.timeMins ?? 4} mins` } as Prisma.InputJsonObject;
    if (!c.bartenderTip) data.bartenderTip = "Chill the glass first — it keeps the serve crisp from the first sip to the last.";
    if (isEmptyArr(c.tags)) data.tags = ["Rum", "Classic", "Easy"];
    if (c.ratingAvg == null) data.ratingAvg = 4.6;
    if (!c.ratingCount) data.ratingCount = 128;
    if (!c.difficulty) data.difficulty = "Easy";
    if (!c.timeMins) data.timeMins = 4;
    if (Object.keys(data).length) { await prisma.cocktail.update({ where: { id: c.id }, data }); n++; }
  }
  return n;
}

async function seedBlog() {
  const posts = await prisma.blogPost.findMany();
  let n = 0;
  for (const p of posts) {
    const data: Prisma.BlogPostUpdateInput = {};
    if (!p.excerpt) data.excerpt = `${p.title}: a short read on the craft, culture and character behind Rumbaclaat.`;
    if (!p.body) data.body = `<p>${p.title} is part of our ongoing journal on premium Caribbean rum.</p><h2>The short version</h2><p>Heritage, patience and a little Caribbean heat. That is the Rumbaclaat way — and this piece unpacks why it matters.</p><p>From the canefields to your glass, every step is intentional. Read on for the full story.</p>`;
    if (!p.seoTitle) data.seoTitle = `${p.title} — Rumbaclaat Journal`;
    if (!p.seoDescription) data.seoDescription = `${p.title} — stories and craft from the Rumbaclaat distillery. Premium Caribbean rum, aged in American oak.`;
    if (!p.category) data.category = "Journal";
    if (!p.readTime) data.readTime = "5 min read";
    if (Object.keys(data).length) { await prisma.blogPost.update({ where: { id: p.id }, data }); n++; }
  }
  return n;
}

async function seedCategories() {
  const cats = await prisma.category.findMany();
  let n = 0;
  for (const c of cats) {
    if (c.description) continue;
    await prisma.category.update({
      where: { id: c.id },
      data: { description: `Explore the Rumbaclaat ${c.name.toLowerCase()} collection — crafted with intention, made to be enjoyed.` },
    });
    n++;
  }
  return n;
}

async function seedTiers() {
  const tiers = await prisma.membershipTier.findMany();
  let n = 0;
  for (const t of tiers) {
    if (!isEmptyArr(t.benefits)) continue;
    await prisma.membershipTier.update({
      where: { id: t.id },
      data: { benefits: [`${t.memberDiscountPct ?? 5}% member discount`, `${Number(t.pointsMultiplier ?? 1)}× loyalty points`, "Early access to new drops", "Members-only events"] },
    });
    n++;
  }
  return n;
}

async function main() {
  const c = await seedCocktails();
  const b = await seedBlog();
  const cat = await seedCategories();
  const t = await seedTiers();
  console.log(`Dummy content backfilled — cocktails:${c} blog:${b} categories:${cat} tiers:${t} (empty fields only).`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
