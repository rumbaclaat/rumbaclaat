/**
 * Comprehensive DEMO data so the admin + analytics look populated during build.
 * Deterministic (seeded PRNG) and idempotent: all rows are tagged with the
 * "@demo.rumbaclaat.test" email domain (or a known reviewer pool) and cleared
 * before re-seeding. Safe to re-run: `npm run db:seed-demo`.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO = "@demo.rumbaclaat.test";

// --- deterministic PRNG ---------------------------------------------------
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20260623);
const pick = <T,>(a: T[]): T => a[Math.floor(rand() * a.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const chance = (p: number) => rand() < p;
const round2 = (n: number) => Math.round(n * 100) / 100;
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(int(8, 20), int(0, 59), 0, 0);
  return d;
}

const FIRST = ["Olivia","Jack","Amara","Marcus","Sophie","Liam","Imani","Noah","Priya","Ethan","Zara","Leon","Maya","Kai","Aisha","Reuben","Chloe","Theo","Nadia","Dominic","Freya","Andre","Esme","Malik","Ruby","Cole","Yasmin","Felix","Tia","Jerome","Bianca","Omar","Lola","Devon","Saskia","Rhys","Inaya","Troy","Elodie","Shaun"];
const LAST = ["Bennett","Clarke","Osei","Whitfield","Nguyen","Ferreira","Okafor","Hargreaves","Sandhu","Mensah","Patel","Donovan","Bourne","Adeyemi","Rashford","Lindqvist","Mercer","Boateng","Caldwell","Sterling","Holloway","Da Silva","Kowalski","Reyes","Ashworth","Campbell","Greaves","Mahmood","Pereira","Quinn"];
const CITIES = ["London","Manchester","Birmingham","Bristol","Leeds","Glasgow","Liverpool","Nottingham","Brighton","Cardiff","Edinburgh","Sheffield"];
const STREETS = ["High Street","Mill Lane","Oakfield Road","Victoria Avenue","Granby Row","Cedar Close","Wharf Street","Camden Walk","Belmont Road","Kingsway","Albion Place","Marsh Lane"];
const POSTPREF = ["E1","M1","B2","BS1","LS1","G1","L1","NG1","BN1","CF10","EH1","S1"];

const ORDER_STATUSES: { s: string; w: number }[] = [
  { s: "delivered", w: 55 }, { s: "dispatched", w: 14 }, { s: "packed", w: 9 },
  { s: "received", w: 12 }, { s: "cancelled", w: 10 },
];
function weighted<T extends { w: number }>(arr: T[]): T {
  const total = arr.reduce((a, b) => a + b.w, 0);
  let r = rand() * total;
  for (const it of arr) { if ((r -= it.w) <= 0) return it; }
  return arr[arr.length - 1];
}

const REVIEW_TITLES = ["Exceptional","Smooth and rich","New favourite","Beautifully made","Worth every penny","Impressed","A real treat","Top shelf","Gift went down well","Will buy again"];
const REVIEW_BODIES = ["Genuinely one of the best I've tried — smooth with a long finish.","Arrived quickly and beautifully packaged. Tastes premium.","Bought as a gift and they loved it. Will be ordering again.","Lovely depth of flavour, not harsh at all. Highly recommend.","Exactly as described. The quality really shows.","Great with the cocktail recipes on the site. Five stars."];
const ENQUIRY_SUBJECTS = ["Question about delivery","Wholesale enquiry","Gift wrapping options","Allergen information","Bulk order for event","Membership question","Cocktail kit availability","Press request"];

const TRADE_COMPANIES = ["The Cask & Crown","Harbour Wines Ltd","Northern Spirits Co","The Tasting Room","Verde Hospitality","Old Town Bottle Shop","Coastal Bar Group","Maple & Rye","The Vault Drinks","Selwyn Fine Foods","Bramble Bars Ltd","Quayside Cellars"];

async function main() {
  // -- clear prior demo data --------------------------------------------
  const prior = await prisma.customer.findMany({ where: { email: { endsWith: DEMO } }, select: { id: true } });
  const priorIds = prior.map((c) => c.id);
  if (priorIds.length) {
    await prisma.pointsLedger.deleteMany({ where: { customerId: { in: priorIds } } });
    await prisma.membershipSubscription.deleteMany({ where: { customerId: { in: priorIds } } });
  }
  await prisma.order.deleteMany({ where: { email: { endsWith: DEMO } } });
  await prisma.customer.deleteMany({ where: { email: { endsWith: DEMO } } });
  await prisma.contactEnquiry.deleteMany({ where: { email: { endsWith: DEMO } } });
  await prisma.newsletterSubscriber.deleteMany({ where: { email: { endsWith: DEMO } } });
  await prisma.review.deleteMany({ where: { title: { endsWith: "·demo" } } });
  await prisma.tradeAccount.deleteMany({ where: { contactEmail: { endsWith: DEMO } } });

  const products = await prisma.product.findMany({ select: { id: true, name: true, basePrice: true } });
  const tiers = await prisma.membershipTier.findMany({ select: { id: true, slug: true, name: true, priceMonthly: true, isFree: true } });
  const paidTiers = tiers.filter((t) => !t.isFree);

  // -- customers ---------------------------------------------------------
  const usedEmails = new Set<string>();
  const custCreate = Array.from({ length: 120 }).map(() => {
    const first = pick(FIRST);
    const last = pick(LAST);
    let email = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "") + DEMO;
    let n = 1;
    while (usedEmails.has(email)) { email = `${first}.${last}${n++}`.toLowerCase().replace(/[^a-z.0-9]/g, "") + DEMO; }
    usedEmails.add(email);
    const tier = chance(0.4) && paidTiers.length ? pick(paidTiers) : (tiers.find((t) => t.isFree) ?? tiers[0]);
    return {
      firstName: first, lastName: last, email,
      phone: `07${int(100, 999)} ${int(100000, 999999)}`,
      dateOfBirth: new Date(int(1965, 2004), int(0, 11), int(1, 28)),
      membershipTierId: tier?.id ?? null,
      pointsBalance: int(0, 4200),
      lifetimeSpend: round2(int(0, 1800) + rand()),
      createdAt: daysAgo(int(1, 365)),
    };
  });
  await prisma.customer.createMany({ data: custCreate });
  const customers = await prisma.customer.findMany({
    where: { email: { endsWith: DEMO } },
    select: { id: true, firstName: true, lastName: true, email: true, phone: true, membershipTierId: true, createdAt: true },
  });

  // addresses
  await prisma.address.createMany({
    data: customers.map((c) => {
      const city = pick(CITIES);
      return {
        customerId: c.id, name: `${c.firstName} ${c.lastName}`,
        line1: `${int(1, 240)} ${pick(STREETS)}`, city,
        postcode: `${pick(POSTPREF)} ${int(1, 9)}${pick(["AA","BX","DJ","ER","HS","NZ","PQ","RS"])}`,
        country: "United Kingdom", isDefault: true,
      };
    }),
  });

  // subscriptions for paid-tier customers
  const subData = customers
    .filter((c) => paidTiers.some((t) => t.id === c.membershipTierId))
    .map((c) => {
      const tier = paidTiers.find((t) => t.id === c.membershipTierId)!;
      const cycle = chance(0.3) ? "annual" : "monthly";
      return {
        customerId: c.id, tierId: tier.id, billingCycle: cycle,
        price: Number(tier.priceMonthly) * (cycle === "annual" ? 10 : 1),
        status: chance(0.9) ? "active" : "past_due",
        startedAt: c.createdAt, nextChargeDate: daysAgo(-int(1, 28)),
      };
    });
  if (subData.length) await prisma.membershipSubscription.createMany({ data: subData, skipDuplicates: true });

  // -- orders ------------------------------------------------------------
  let seq = 4200;
  const year = new Date().getFullYear();
  type OrderPlan = { ref: string; email: string; name: string; items: { name: string; productId: string; unitPrice: number; qty: number; lineTotal: number }[]; subtotal: number; shipping: number; total: number; status: string; paymentStatus: string; placedAt: Date; pointsEarned: number; customerId: string };
  const plans: OrderPlan[] = [];
  for (const c of customers) {
    if (!products.length) break;
    if (chance(0.32)) continue; // ~68% of customers have orders
    const count = int(1, 5);
    for (let i = 0; i < count; i++) {
      const lineN = int(1, 3);
      const items = Array.from({ length: lineN }).map(() => {
        const p = pick(products);
        const qty = int(1, 3);
        const unit = Number(p.basePrice);
        return { name: p.name, productId: p.id, unitPrice: unit, qty, lineTotal: round2(unit * qty) };
      });
      const subtotal = round2(items.reduce((a, b) => a + b.lineTotal, 0));
      const shipping = subtotal >= 50 ? 0 : 4.99;
      const st = weighted(ORDER_STATUSES).s;
      plans.push({
        ref: `RC-${year}-${seq++}`, email: c.email, name: `${c.firstName} ${c.lastName}`,
        items, subtotal, shipping, total: round2(subtotal + shipping), status: st,
        paymentStatus: st === "cancelled" ? (chance(0.5) ? "refunded" : "pending") : "paid",
        placedAt: daysAgo(int(0, 364)), pointsEarned: Math.round(subtotal), customerId: c.id,
      });
    }
  }
  await prisma.order.createMany({
    data: plans.map((p) => ({
      ref: p.ref, email: p.email, customerId: p.customerId, customerName: p.name, status: p.status,
      subtotal: p.subtotal, shipping: p.shipping, total: p.total, pointsEarned: p.pointsEarned,
      deliveryMethod: chance(0.2) ? "Express" : "Standard", paymentMethod: "card",
      paymentStatus: p.paymentStatus, placedAt: p.placedAt,
    })),
  });
  const orders = await prisma.order.findMany({ where: { ref: { in: plans.map((p) => p.ref) } }, select: { id: true, ref: true } });
  const refToId = new Map(orders.map((o) => [o.ref, o.id]));
  // order timeline (placed + current status)
  await prisma.orderTimeline.createMany({
    data: plans.flatMap((p) => {
      const id = refToId.get(p.ref)!;
      const ev: { orderId: string; status: string; note: string | null; createdBy: string; createdAt: Date }[] = [
        { orderId: id, status: "received", note: "Order placed", createdBy: "system", createdAt: p.placedAt },
      ];
      if (p.status !== "received") {
        ev.push({ orderId: id, status: p.status, note: null, createdBy: "system", createdAt: new Date(p.placedAt.getTime() + 86400000) });
      }
      return ev;
    }),
  });
  await prisma.orderItem.createMany({
    data: plans.flatMap((p) => p.items.map((it) => ({
      orderId: refToId.get(p.ref)!, productId: it.productId, name: it.name,
      unitPrice: it.unitPrice, qty: it.qty, lineTotal: it.lineTotal,
    }))),
  });
  // points ledger entries for paid orders
  await prisma.pointsLedger.createMany({
    data: plans.filter((p) => p.paymentStatus === "paid").map((p) => ({
      customerId: p.customerId, delta: p.pointsEarned, reason: "purchase",
      relatedOrderId: refToId.get(p.ref)!, balanceAfter: p.pointsEarned, note: `Order ${p.ref}`,
      createdAt: p.placedAt,
    })),
  });

  // -- reviews (recompute product aggregates) ---------------------------
  if (products.length) {
    const reviewData = Array.from({ length: 80 }).map(() => {
      const p = pick(products);
      const rating = chance(0.7) ? 5 : chance(0.6) ? 4 : 3;
      return {
        productId: p.id, authorName: `${pick(FIRST)} ${pick(LAST)[0]}.`,
        memberTier: chance(0.5) ? pick(["Silver", "Gold", "Black Reserve"]) : null,
        rating, title: `${pick(REVIEW_TITLES)}·demo`, body: pick(REVIEW_BODIES),
        status: "live", createdAt: daysAgo(int(1, 300)),
      };
    });
    await prisma.review.createMany({ data: reviewData });
    for (const p of products) {
      const agg = await prisma.review.aggregate({
        where: { productId: p.id, status: "live" }, _avg: { rating: true }, _count: true,
      });
      await prisma.product.update({
        where: { id: p.id },
        data: { ratingAvg: agg._avg.rating ? round2(agg._avg.rating) : null, reviewCount: agg._count },
      });
    }
  }

  // -- enquiries ---------------------------------------------------------
  await prisma.contactEnquiry.createMany({
    data: Array.from({ length: 40 }).map(() => {
      const type = chance(0.25) ? "trade" : "general";
      return {
        type, name: `${pick(FIRST)} ${pick(LAST)}`,
        email: `${pick(FIRST)}.${pick(LAST)}`.toLowerCase() + DEMO,
        phone: chance(0.6) ? `07${int(100, 999)} ${int(100000, 999999)}` : null,
        subject: pick(ENQUIRY_SUBJECTS), message: pick(REVIEW_BODIES),
        status: pick(["new", "new", "read", "replied", "closed"]),
        createdAt: daysAgo(int(0, 120)),
      };
    }),
  });

  // -- newsletter --------------------------------------------------------
  const subs = new Set<string>();
  const subRows = [];
  for (let i = 0; i < 250; i++) {
    let e = `${pick(FIRST)}.${pick(LAST)}${i}`.toLowerCase() + DEMO;
    if (subs.has(e)) e = `n${i}` + DEMO;
    subs.add(e);
    subRows.push({ email: e, firstName: pick(FIRST), status: chance(0.92) ? "subscribed" : "unsubscribed", createdAt: daysAgo(int(0, 365)) });
  }
  await prisma.newsletterSubscriber.createMany({ data: subRows, skipDuplicates: true });

  // -- trade accounts ----------------------------------------------------
  for (let i = 0; i < TRADE_COMPANIES.length; i++) {
    const company = TRADE_COMPANIES[i];
    const contact = `${pick(FIRST)} ${pick(LAST)}`;
    const outstanding = chance(0.5) ? round2(int(0, 4000) + rand()) : 0;
    const acct = await prisma.tradeAccount.create({
      data: {
        companyName: company, contactName: contact,
        contactEmail: `accounts.${company.toLowerCase().replace(/[^a-z]/g, "")}${i}` + DEMO,
        phone: `01${int(100, 999)} ${int(100000, 999999)}`,
        businessType: pick(["Off-licence / Retailer", "Bar / Restaurant", "Hotel", "Distributor", "Events"]),
        vatNumber: `GB${int(100000000, 999999999)}`,
        creditLimit: pick([5000, 7500, 10000, 15000]),
        outstandingBalance: outstanding,
        status: pick(["active", "active", "active", "pending", "suspended"]),
      },
    });
    const orderN = int(1, 4);
    for (let j = 0; j < orderN; j++) {
      const cases = int(2, 12);
      const ppb = pick([17.5, 18.75, 20, 22.75, 24.5, 26]);
      const net = round2(cases * 6 * ppb);
      await prisma.tradeOrder.create({
        data: {
          ref: `ORD-${year}-${5000 + i * 10 + j}`, tradeAccountId: acct.id,
          lines: [{ name: pick(products)?.name ?? "Original Reserve", cases, pricePerBottle: ppb }],
          netTotal: net, vat: round2(net * 0.2), grandTotal: round2(net * 1.2),
          status: pick(["processing", "confirmed", "delivered", "delivered"]),
          placedAt: daysAgo(int(1, 200)),
        },
      });
    }
    const invN = int(1, 3);
    for (let j = 0; j < invN; j++) {
      const amount = round2(int(300, 3000) + rand());
      await prisma.invoice.create({
        data: {
          ref: `INV-${year}-${5000 + i * 10 + j}`, tradeAccountId: acct.id,
          amount, vat: round2(amount * 0.2),
          status: pick(["open", "open", "paid", "overdue"]),
          dueDate: daysAgo(-int(1, 45)), issuedAt: daysAgo(int(1, 90)),
        },
      });
    }
    await prisma.tradeMessage.createMany({
      data: Array.from({ length: int(1, 3) }).map(() => ({
        tradeAccountId: acct.id, direction: chance(0.5) ? "inbound" : "outbound",
        subject: pick(["Pricing update", "Order query", "Delivery schedule", "Account review"]),
        body: pick(REVIEW_BODIES), read: chance(0.5), createdAt: daysAgo(int(0, 60)),
      })),
    });
  }

  console.log(`Demo data seeded: ${customers.length} customers, ${plans.length} orders, 80 reviews, 40 enquiries, ${subRows.length} subscribers, ${TRADE_COMPANIES.length} trade accounts.`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
