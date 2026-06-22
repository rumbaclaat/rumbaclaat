/**
 * Seed the Rumbaclaat database with BASE catalogue data from the static-source
 * reference. All values are editable in the CMS later — this is a starting point,
 * not fixed pricing. Idempotent (upserts by unique slug/sku).
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TIERS = [
  { slug: "bronze", name: "Bronze", priceMonthly: 0, priceAnnual: 0, pointsMultiplier: 1, memberDiscountPct: 5, isFree: true, sortOrder: 1,
    benefits: ["5% member discount", "Birthday bonus points", "Early email access", "Members newsletter"] },
  { slug: "silver", name: "Silver", priceMonthly: 9.99, priceAnnual: 89.99, pointsMultiplier: 1.5, memberDiscountPct: 10, isFree: false, sortOrder: 2,
    benefits: ["10% member discount", "Early drop access (24hrs)", "Free UK standard shipping", "Exclusive cocktail recipes"] },
  { slug: "gold", name: "Gold", priceMonthly: 24.99, priceAnnual: 224.99, pointsMultiplier: 2, memberDiscountPct: 15, isFree: false, sortOrder: 3,
    benefits: ["15% member discount", "Early drop access (48hrs)", "Free UK express shipping", "Annual gift bottle", "Tasting event invitations"] },
  { slug: "black-reserve", name: "Black Reserve", priceMonthly: 54.99, priceAnnual: 499.99, pointsMultiplier: 3, memberDiscountPct: 20, isFree: false, sortOrder: 4,
    benefits: ["20% member discount", "Priority drop access (72hrs)", "Free worldwide shipping", "Private distillery visits", "Concierge service", "Bespoke bottle engraving"] },
];

const CATEGORIES = [
  { slug: "rum", name: "Rum Collection", sortOrder: 1 },
  { slug: "mens-apparel", name: "Men's Apparel", sortOrder: 2 },
  { slug: "womens-apparel", name: "Women's Apparel", sortOrder: 3 },
  { slug: "gift-cards", name: "Gift Cards", sortOrder: 4 },
];

type SeedProduct = {
  slug: string; sku: string; type: "rum" | "apparel" | "cap" | "gift_card";
  name: string; subtitle?: string; categorySlug: string;
  basePrice: number; onSale?: boolean; salePrice?: number; basePoints: number;
  abv?: number; volume?: string; origin?: string; material?: string;
  ratingAvg?: number; reviewCount?: number; stockQty: number;
  colours?: { name: string; hex: string }[]; sizes?: string[];
};

const PRODUCTS: SeedProduct[] = [
  { slug: "original-reserve", sku: "rum-001", type: "rum", name: "Rumbaclaat Original Reserve",
    subtitle: "12 Year Aged Rum · 43% ABV · 70cl · Jamaica", categorySlug: "rum",
    basePrice: 49.99, basePoints: 250, abv: 43, volume: "70cl", origin: "Jamaica",
    ratingAvg: 5.0, reviewCount: 124, stockQty: 48 },
  { slug: "spiced-gold", sku: "rum-002", type: "rum", name: "Rumbaclaat Spiced Gold",
    subtitle: "Signature Spiced · 40% ABV · 70cl · Barbados", categorySlug: "rum",
    basePrice: 38.99, onSale: true, salePrice: 31.19, basePoints: 195, abv: 40, volume: "70cl", origin: "Barbados",
    ratingAvg: 5.0, reviewCount: 87, stockQty: 92 },
  { slug: "black-reserve-tee", sku: "men-001", type: "apparel", name: "Black Reserve Tee",
    subtitle: "Heavyweight 240gsm combed cotton", categorySlug: "mens-apparel",
    basePrice: 45.0, basePoints: 225, material: "240gsm combed cotton", ratingAvg: 4.8, reviewCount: 38, stockQty: 60,
    colours: [{ name: "Black", hex: "#1a1a1a" }, { name: "Bone", hex: "#e8dfd0" }, { name: "Tobacco", hex: "#7a5a3a" }],
    sizes: ["S", "M", "L", "XL", "XXL"] },
  { slug: "gold-label-hoodie", sku: "men-002", type: "apparel", name: "Gold Label Hoodie",
    subtitle: "450gsm heavyweight French Terry", categorySlug: "mens-apparel",
    basePrice: 95.0, onSale: true, salePrice: 80.0, basePoints: 400, material: "450gsm French Terry", ratingAvg: 5.0, reviewCount: 63, stockQty: 45,
    colours: [{ name: "Black", hex: "#1a1a1a" }, { name: "Charcoal", hex: "#3a3a3a" }, { name: "Stone", hex: "#b8a98f" }],
    sizes: ["S", "M", "L", "XL", "XXL"] },
  { slug: "reserve-cap", sku: "men-003", type: "cap", name: "Reserve Embroidered Cap",
    subtitle: "Six-panel matte black twill, gold monogram", categorySlug: "mens-apparel",
    basePrice: 35.0, basePoints: 175, ratingAvg: 4.0, reviewCount: 12, stockQty: 80, sizes: ["One Size"] },
  { slug: "script-tee", sku: "wmn-001", type: "apparel", name: "Rumbaclaat Script Tee",
    subtitle: "Women's Relaxed Fit · 220gsm soft-washed jersey", categorySlug: "womens-apparel",
    basePrice: 42.0, basePoints: 210, material: "220gsm jersey", ratingAvg: 5.0, reviewCount: 19, stockQty: 50,
    sizes: ["XS", "S", "M", "L", "XL"] },
  { slug: "gold-signature-sweatshirt", sku: "wmn-002", type: "apparel", name: "Gold Signature Sweatshirt",
    subtitle: "Women's Oversized · 380gsm loopback cotton fleece", categorySlug: "womens-apparel",
    basePrice: 85.0, basePoints: 425, material: "380gsm loopback fleece", ratingAvg: 5.0, reviewCount: 24, stockQty: 40,
    sizes: ["XS", "S", "M", "L", "XL"] },
];

async function main() {
  // Settings singleton
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  // Membership tiers
  for (const t of TIERS) {
    await prisma.membershipTier.upsert({ where: { slug: t.slug }, update: t, create: t });
  }

  // Categories
  const categoryIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
    categoryIdBySlug.set(c.slug, cat.id);
  }

  // Products + variants
  for (const p of PRODUCTS) {
    const { colours, sizes, categorySlug, ...rest } = p;
    const data = {
      ...rest,
      status: "published" as const,
      categoryId: categoryIdBySlug.get(categorySlug) ?? null,
    };
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: data,
      create: data,
    });

    // Build variant matrix: colours × sizes (or sizes only, or single).
    const colourList = colours ?? [{ name: "", hex: "" }];
    const sizeList = sizes ?? ["One Size"];
    for (const colour of colourList) {
      for (const size of sizeList) {
        const parts = [p.sku, colour.name, size].filter(Boolean);
        const variantSku = parts.join("-");
        await prisma.productVariant.upsert({
          where: { sku: variantSku },
          update: {
            productId: product.id,
            colourName: colour.name || null,
            colourHex: colour.hex || null,
            size,
          },
          create: {
            productId: product.id,
            sku: variantSku,
            colourName: colour.name || null,
            colourHex: colour.hex || null,
            size,
          },
        });
      }
    }
  }

  const [tiers, cats, products, variants] = await Promise.all([
    prisma.membershipTier.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
  ]);
  console.log(`Seeded: ${tiers} tiers, ${cats} categories, ${products} products, ${variants} variants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
