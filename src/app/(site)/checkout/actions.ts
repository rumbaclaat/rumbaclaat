"use server";

import { prisma } from "@/lib/prisma";
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

export async function createOrder(input: OrderInput) {
  if (!input.items?.length) throw new Error("Cart is empty");

  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  const freeThreshold = Number(settings?.freeShippingThreshold ?? 50);
  const stdCost = Number(settings?.shippingStandardCost ?? 4.99);
  const expCost = Number(settings?.shippingExpressCost ?? 9.99);

  let subtotal = 0;
  let pointsEarned = 0;
  const orderItems: {
    productId: string;
    variantId: string | null;
    name: string;
    unitPrice: number;
    qty: number;
    lineTotal: number;
  }[] = [];

  // Recompute prices from the DB — never trust client-supplied prices.
  for (const line of input.items) {
    const product = await prisma.product.findUnique({
      where: { id: line.productId },
      include: { variants: true },
    });
    if (!product) continue;
    const variant = line.variantId
      ? product.variants.find((v) => v.id === line.variantId)
      : null;
    const base =
      product.onSale && product.salePrice != null
        ? Number(product.salePrice)
        : Number(product.basePrice);
    const unit = base + (variant ? Number(variant.priceDelta) : 0);
    const qty = Math.max(1, line.qty);
    const lineTotal = unit * qty;
    subtotal += lineTotal;
    pointsEarned += product.basePoints * qty;
    orderItems.push({
      productId: product.id,
      variantId: variant?.id ?? null,
      name:
        product.name +
        (variant
          ? ` (${[variant.colourName, variant.size].filter(Boolean).join(" / ")})`
          : ""),
      unitPrice: unit,
      qty,
      lineTotal,
    });
  }

  if (orderItems.length === 0) throw new Error("No valid items in cart");

  const shipping =
    input.deliveryMethod === "express"
      ? expCost
      : subtotal >= freeThreshold
        ? 0
        : stdCost;
  const total = subtotal + shipping;
  const ref = `RC-${new Date().getFullYear()}-${String(
    Math.floor(10000 + Math.random() * 90000)
  )}`;

  const order = await prisma.order.create({
    data: {
      ref,
      email: input.email,
      customerName: input.name,
      phone: input.phone ?? null,
      status: "received",
      paymentStatus: "simulated",
      subtotal,
      shipping,
      total,
      pointsEarned,
      deliveryMethod: input.deliveryMethod,
      paymentMethod: input.paymentMethod,
      shippingAddress: input.address,
      items: { create: orderItems },
    },
  });

  revalidatePath("/admin/orders");
  return { ref: order.ref, total, pointsEarned };
}
