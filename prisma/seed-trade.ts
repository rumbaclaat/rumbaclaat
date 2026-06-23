/** Seeds a demo trade account, wholesale pricing bands, and sample orders/invoices/messages. */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Volume pricing (per bottle), from static-source/trade.html. Case = 6 bottles.
const PRICING: Record<string, { band: string; ppb: number }[]> = {
  "rum-001": [
    { band: "1-4", ppb: 26.0 },
    { band: "5-9", ppb: 24.5 },
    { band: "10+", ppb: 22.75 },
  ],
  "rum-002": [
    { band: "1-4", ppb: 20.0 },
    { band: "5-9", ppb: 18.75 },
    { band: "10+", ppb: 17.5 },
  ],
};

async function main() {
  // Demo account
  const account = await prisma.tradeAccount.upsert({
    where: { contactEmail: "sarah@therumhouse.co.uk" },
    update: {},
    create: {
      companyName: "The Rum House Ltd",
      contactName: "Sarah Johnson",
      contactEmail: "sarah@therumhouse.co.uk",
      businessType: "Off-licence / Retailer",
      vatNumber: "GB123456789",
      creditLimit: 5000,
      outstandingBalance: 849.6,
      status: "active",
    },
  });

  // Pricing bands
  for (const [sku, bands] of Object.entries(PRICING)) {
    const product = await prisma.product.findUnique({ where: { sku } });
    if (!product) continue;
    await prisma.tradeProductPricing.deleteMany({ where: { productId: product.id } });
    for (let i = 0; i < bands.length; i++) {
      await prisma.tradeProductPricing.create({
        data: {
          productId: product.id,
          volumeBand: bands[i].band,
          pricePerBottle: bands[i].ppb,
          pricePerCase: Math.round(bands[i].ppb * 6 * 100) / 100,
          sortOrder: i,
        },
      });
    }
  }

  // Sample orders + invoices + messages (only if none yet)
  const existingOrders = await prisma.tradeOrder.count({ where: { tradeAccountId: account.id } });
  if (existingOrders === 0) {
    await prisma.tradeOrder.create({
      data: {
        ref: "ORD-2025-0041", tradeAccountId: account.id,
        lines: [{ name: "Original Reserve", cases: 5, pricePerBottle: 24.5 }],
        netTotal: 735, vat: 147, grandTotal: 882, status: "delivered",
      },
    });
    await prisma.tradeOrder.create({
      data: {
        ref: "ORD-2025-0039", tradeAccountId: account.id,
        lines: [{ name: "Original Reserve", cases: 3, pricePerBottle: 26 }, { name: "Spiced Gold", cases: 2, pricePerBottle: 20 }],
        netTotal: 708, vat: 141.6, grandTotal: 849.6, status: "processing",
      },
    });
    await prisma.invoice.create({
      data: { ref: "INV-2025-0039", tradeAccountId: account.id, amount: 849.6, vat: 141.6, status: "open" },
    });
    await prisma.tradeMessage.createMany({
      data: [
        { tradeAccountId: account.id, direction: "outbound", subject: "Q1 2025 Pricing Update", body: "Please find attached your updated pricing schedule for Q1 2025.", read: false },
        { tradeAccountId: account.id, direction: "outbound", subject: "Order ORD-2025-0039 Confirmed", body: "Your order has been confirmed and is being processed.", read: false },
        { tradeAccountId: account.id, direction: "outbound", subject: "Welcome to Rumbaclaat Trade", body: "Welcome to our trade platform. Your account has been approved.", read: true },
      ],
    });
  }

  console.log("Seeded demo trade account, pricing, orders, invoices, messages");
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
