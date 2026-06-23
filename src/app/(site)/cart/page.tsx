import { prisma } from "@/lib/prisma";
import CartView from "@/components/cart/cart-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cart", robots: "noindex,nofollow" };

export default async function CartPage() {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
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
        />
      </div>
    </section>
  );
}
