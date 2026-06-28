"use server";

import { prisma } from "@/lib/prisma";
import { creditPoints } from "@/lib/points";
import { ppCreateOrder, ppCaptureOrder } from "@/lib/paypal";
import { revalidatePath } from "next/cache";

export type CartLine = { productId: string; variantId?: string; qty: number };

export type OrderInput = {
  items: CartLine[];
  email: string;
  name: string;
  phone?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  deliveryMethod: "standard" | "express";
  paymentMethod: string;
};

type Priced = {
  orderItems: { productId: string; variantId: string | null; name: string; unitPrice: number; qty: number; lineTotal: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  pointsEarned: number;
  memberDiscount: number;
  currency: string;
  customerId: string | null;
};

/** Re-price the cart from the DB — never trust client-supplied prices. */
async function priceCart(input: OrderInput): Promise<Priced> {
  if (!input.items?.length) throw new Error("Cart is empty");

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const freeThreshold = Number(settings?.freeShippingThreshold ?? 50);
  const stdCost = Number(settings?.shippingStandardCost ?? 4.99);
  const expCost = Number(settings?.shippingExpressCost ?? 9.99);
  const currency = settings?.currency ?? "GBP";

  let subtotal = 0;
  let basePointsSum = 0;
  const orderItems: Priced["orderItems"] = [];

  for (const line of input.items) {
    const product = await prisma.product.findUnique({ where: { id: line.productId }, include: { variants: true } });
    if (!product) continue;
    const variant = line.variantId ? product.variants.find((v) => v.id === line.variantId) : null;
    const base = product.onSale && product.salePrice != null ? Number(product.salePrice) : Number(product.basePrice);
    const unit = base + (variant ? Number(variant.priceDelta) : 0);
    const qty = Math.max(1, line.qty);
    const lineTotal = unit * qty;
    subtotal += lineTotal;
    basePointsSum += product.basePoints * qty;
    orderItems.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name: product.name + (variant ? ` (${[variant.colourName, variant.size].filter(Boolean).join(" / ")})` : ""),
      unitPrice: unit,
      qty,
      lineTotal,
    });
  }
  if (orderItems.length === 0) throw new Error("No valid items in cart");

  const customer = await prisma.customer.findUnique({ where: { email: input.email } });
  const tier = customer?.membershipTierId ? await prisma.membershipTier.findUnique({ where: { id: customer.membershipTierId } }) : null;
  const memberDiscountPct = tier?.memberDiscountPct ?? 0;
  const multiplier = tier ? Number(tier.pointsMultiplier) : 1;

  const memberDiscount = Math.round(subtotal * (memberDiscountPct / 100) * 100) / 100;
  const discountedSubtotal = subtotal - memberDiscount;
  const pointsEarned = Math.round(basePointsSum * multiplier);
  const shipping = input.deliveryMethod === "express" ? expCost : subtotal >= freeThreshold ? 0 : stdCost;
  const total = Math.round((discountedSubtotal + shipping) * 100) / 100;

  return { orderItems, subtotal, shipping, total, pointsEarned, memberDiscount, currency, customerId: customer?.id ?? null };
}

/** Persist the order + credit points. `payment` carries the gateway result. */
async function persistOrder(input: OrderInput, priced: Priced, payment: { status: string; method: string; ref?: string | null }) {
  const ref = `RC-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
  const order = await prisma.order.create({
    data: {
      ref,
      email: input.email,
      customerName: input.name,
      phone: input.phone ?? null,
      status: "received",
      paymentStatus: payment.status,
      paymentMethod: payment.method,
      paymentRef: payment.ref ?? null,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
      pointsEarned: priced.pointsEarned,
      deliveryMethod: input.deliveryMethod,
      shippingAddress: input.address,
      items: { create: priced.orderItems },
    },
  });

  if (priced.customerId) {
    await creditPoints(priced.customerId, priced.pointsEarned, "purchase", { relatedOrderId: order.id, note: `Order ${order.ref}` });
    await prisma.customer.update({ where: { id: priced.customerId }, data: { lifetimeSpend: { increment: priced.total } } });
  }
  revalidatePath("/admin/orders");
  return { ref: order.ref, total: priced.total, pointsEarned: priced.pointsEarned, memberDiscount: priced.memberDiscount };
}

/** Non-PayPal path (card / google pay are simulated in this build). */
export async function createOrder(input: OrderInput) {
  const priced = await priceCart(input);
  return persistOrder(input, priced, { status: "simulated", method: input.paymentMethod });
}

/** PayPal: create an order on PayPal for the server-computed total. Returns the PayPal order id. */
export async function createPaypalOrder(input: OrderInput): Promise<{ id: string; total: number; currency: string }> {
  const priced = await priceCart(input);
  const { id } = await ppCreateOrder(priced.total, priced.currency);
  return { id, total: priced.total, currency: priced.currency };
}

/** PayPal: capture the approved order and persist a PAID order idempotently (keyed on the PayPal order id). */
export async function capturePaypalOrder(paypalOrderId: string, input: OrderInput) {
  // Idempotency — if we already recorded this PayPal order, return it.
  const existing = await prisma.order.findFirst({ where: { paymentRef: paypalOrderId }, select: { ref: true, total: true, pointsEarned: true } });
  if (existing) return { ref: existing.ref, total: Number(existing.total), pointsEarned: existing.pointsEarned, memberDiscount: 0 };

  const capture = await ppCaptureOrder(paypalOrderId);
  if (capture.status !== "COMPLETED") throw new Error(`Payment not completed (status: ${capture.status}).`);

  const priced = await priceCart(input);
  try {
    return await persistOrder(input, priced, { status: "paid", method: "paypal", ref: paypalOrderId });
  } catch (e) {
    // Unique race: another request already persisted this capture — return it.
    const dup = await prisma.order.findFirst({ where: { paymentRef: paypalOrderId }, select: { ref: true, total: true, pointsEarned: true } });
    if (dup) return { ref: dup.ref, total: Number(dup.total), pointsEarned: dup.pointsEarned, memberDiscount: 0 };
    throw e;
  }
}
