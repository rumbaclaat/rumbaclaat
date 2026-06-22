/** Seeds demo blog posts + cocktails (idempotent, upsert by slug). */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const POSTS = [
  {
    slug: "the-story-behind-rumbaclaat",
    title: "The Story Behind Rumbaclaat",
    category: "Heritage",
    excerpt: "From the Caribbean canefields to your glass — the origins of our brand.",
    body: "<p>Rumbaclaat began with a simple idea: to bottle the spirit of the Caribbean. Distilled in Jamaica and aged a minimum of twelve years in ex-bourbon American oak, every expression is a tribute to heritage and craft.</p><h2>From cane to cask</h2><p>The journey starts in the canefields, where the heat accelerates maturation — one year in Trinidad is worth three in Scotland.</p>",
    readTime: "6 min read",
    featured: true,
    publishDate: new Date("2025-01-20"),
  },
  {
    slug: "the-art-of-rum-ageing",
    title: "The Art of Rum Ageing",
    category: "Craft",
    excerpt: "Understanding the journey from distillate to reserve expression.",
    body: "<p>Ageing is where rum finds its character. The interplay of oak, climate and time transforms a clear distillate into something complex and warming.</p>",
    readTime: "8 min read",
    publishDate: new Date("2025-01-10"),
  },
  {
    slug: "cocktail-culture-in-2025",
    title: "Cocktail Culture in 2025",
    category: "Cocktails",
    excerpt: "The trends shaping premium cocktail experiences worldwide.",
    body: "<p>Premium rum is at the heart of the modern cocktail renaissance. Here's what's shaping the bar in 2025.</p>",
    readTime: "5 min read",
    publishDate: new Date("2025-01-05"),
  },
];

const COCKTAILS = [
  {
    slug: "rumbaclaat-sour",
    name: "Rumbaclaat Sour",
    eyebrow: "Signature serve",
    lede: "Fresh lime, egg white, bitters. An elegant aperitif.",
    difficulty: "Easy",
    occasion: "Aperitif",
    timeMins: 5,
    ingredients: ["60ml Original Reserve", "30ml fresh lime juice", "20ml simple syrup", "1 egg white (or aquafaba)", "3 dashes aromatic bitters"],
    method: ["Dry shake all ingredients without ice", "Add ice and shake again until chilled", "Strain into a chilled coupe", "Garnish with a few drops of bitters"],
    serviceNotes: { Glassware: "Coupe", Garnish: "Bitters", Pairing: "Citrus desserts", "Total time": "5 mins" },
    bartenderTip: "The dry shake builds a silky foam — don't skip it.",
    productSlug: "original-reserve",
  },
  {
    slug: "spiced-mule",
    name: "Spiced Mule",
    eyebrow: "Long & refreshing",
    lede: "Spiced Gold, ginger beer and lime over ice.",
    difficulty: "Easy",
    occasion: "Party / Summer",
    timeMins: 3,
    ingredients: ["50ml Spiced Gold", "150ml premium ginger beer", "15ml fresh lime juice", "Lime wedge", "Mint sprig"],
    method: ["Fill a copper mug with ice", "Add Spiced Gold and lime", "Top with ginger beer", "Garnish with lime and mint"],
    serviceNotes: { Glassware: "Copper mug", Garnish: "Lime & mint", "Total time": "3 mins" },
    bartenderTip: "Use a fiery ginger beer for the best contrast with the spice.",
    productSlug: "spiced-gold",
  },
];

async function main() {
  for (const p of POSTS) {
    const { slug, ...rest } = p;
    await prisma.blogPost.upsert({
      where: { slug },
      update: { ...rest, status: "published" },
      create: { slug, ...rest, status: "published" },
    });
  }

  for (const c of COCKTAILS) {
    const { slug, productSlug, ingredients, method, serviceNotes, ...rest } = c;
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    const data = {
      ...rest,
      ingredients: ingredients as object,
      method: method as object,
      serviceNotes: serviceNotes as object,
      featuredProductId: product?.id ?? null,
      status: "published" as const,
    };
    await prisma.cocktail.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
  }

  console.log(`Seeded ${POSTS.length} posts + ${COCKTAILS.length} cocktails`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
