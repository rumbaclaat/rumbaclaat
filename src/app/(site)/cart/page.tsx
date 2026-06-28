import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/auth";
import CartView from "@/components/cart/cart-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cart", robots: "noindex,nofollow" };

export default async function CartPage() {
  const [settings, session] = await Promise.all([
    prisma.settings.findUnique({ where: { id: "default" } }),
    getCustomer(),
  ]);
  const pointsBalance = session?.customer.pointsBalance ?? 0;
  return (
    <section className="section">
      <div className="container">
        <div className="mb-4">
          <span className="eyebrow">Your Cart</span>
          <h1>Cart</h1>
        </div>
        <CartView
          freeShippingThreshold={Number(settings?.freeShippingThreshold ?? 50)}
          shippingStandardCost={Number(settings?.shippingStandardCost ?? 4.99)}
          pointsBalance={pointsBalance}
          pointsPerPound={Number(settings?.pointsPerPound ?? 100)}
          signedIn={Boolean(session)}
        />
      </div>
    </section>
  );
}
