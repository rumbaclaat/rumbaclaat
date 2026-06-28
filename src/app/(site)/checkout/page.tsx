import { prisma } from "@/lib/prisma";
import CheckoutFlow, { type CheckoutPrefill } from "@/components/cart/checkout-flow";
import { getCustomer } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout", robots: "noindex,nofollow" };

export default async function CheckoutPage() {
  const [settings, auth] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "default" } }),
    getCustomer(),
  ]);

  // Guest checkout by default; for a signed-in member, pre-fill saved details.
  let initial: CheckoutPrefill | undefined;
  if (auth?.customer) {
    const customer = await prisma.customer.findUnique({
      where: { id: auth.customer.id },
      include: { addresses: { orderBy: { isDefault: "desc" }, take: 1 } },
    });
    const addr = customer?.addresses[0];
    initial = {
      fname: customer?.firstName ?? "",
      lname: customer?.lastName ?? "",
      email: customer?.email ?? "",
      phone: customer?.phone ?? "",
      addr1: addr?.line1 ?? "",
      addr2: addr?.line2 ?? "",
      city: addr?.city ?? "",
      postcode: addr?.postcode ?? "",
      country: addr?.country ?? "United Kingdom",
    };
  }

  return (
    <CheckoutFlow
      settings={{
        freeShippingThreshold: Number(settings?.freeShippingThreshold ?? 50),
        shippingStandardCost: Number(settings?.shippingStandardCost ?? 4.99),
        shippingExpressCost: Number(settings?.shippingExpressCost ?? 9.99),
      }}
      initial={initial}
    />
  );
}
