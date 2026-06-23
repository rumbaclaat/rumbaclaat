/** Seeds the rewards catalogue (idempotent by name). */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const REWARDS = [
  { name: "£10 Store Credit", pointsCost: 500, type: "credit", value: "£10", availability: "available", sortOrder: 1, description: "£10 off your next order." },
  { name: "Free Cocktail Kit", pointsCost: 750, type: "item", value: "Cocktail kit", availability: "available", sortOrder: 2, description: "A Rumbaclaat cocktail kit, on us." },
  { name: "Personalised Bottle Label", pointsCost: 800, type: "item", value: "Engraving", availability: "available", sortOrder: 3, description: "Custom label on your next bottle." },
  { name: "Early Drop Access", pointsCost: 1000, type: "access", value: "48h early", availability: "available", sortOrder: 4, description: "Shop new drops 48 hours early." },
  { name: "20% Off Next Order", pointsCost: 1200, type: "discount", value: "20%", availability: "available", sortOrder: 5, description: "20% off your next order." },
  { name: "Private Tasting Event", pointsCost: 2000, type: "experience", value: "Event", availability: "coming_soon", sortOrder: 6, description: "An invite to a private tasting." },
];

async function main() {
  for (const r of REWARDS) {
    const existing = await prisma.reward.findFirst({ where: { name: r.name } });
    if (existing) {
      await prisma.reward.update({ where: { id: existing.id }, data: r });
    } else {
      await prisma.reward.create({ data: r });
    }
  }
  console.log(`Seeded ${REWARDS.length} rewards`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
