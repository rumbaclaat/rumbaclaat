import { prisma } from "@/lib/prisma";
import CheckoutFlow from "@/components/cart/checkout-flow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout", robots: "noindex,nofollow" };

export default async function CheckoutPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  return (
    <CheckoutFlow
      settings={{
        freeShippingThreshold: Number(settings?.freeShippingThreshold ?? 50),
        shippingStandardCost: Number(settings?.shippingStandardCost ?? 4.99),
        shippingExpressCost: Number(settings?.shippingExpressCost ?? 9.99),
      }}
    />
  );
}
