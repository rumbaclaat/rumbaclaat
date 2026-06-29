import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCustomer } from "@/lib/auth";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order detail", robots: "noindex,nofollow" };

// Status flow used by the storefront order timeline.
const STEPS = [
  { key: "received", title: "Order received" },
  { key: "paid", title: "Payment confirmed" },
  { key: "packed", title: "Packed at warehouse" },
  { key: "dispatched", title: "Dispatched" },
  { key: "out_for_delivery", title: "Out for delivery" },
  { key: "delivered", title: "Delivered" },
] as const;

// How far through the timeline a given order.status reaches (index of the
// currently-active step). Maps the live DB status onto the design's six steps.
const STATUS_INDEX: Record<string, number> = {
  received: 0,
  paid: 1,
  packed: 2,
  dispatched: 3,
  out_for_delivery: 4,
  delivered: 5,
};

const STATUS_LABEL: Record<string, string> = {
  received: "Order received",
  paid: "Payment confirmed",
  packed: "Packed",
  dispatched: "Dispatched",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(d);
}

type Addr = { name?: string; line1?: string; line2?: string; city?: string; postcode?: string; country?: string };

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const session = await getCustomer();
  if (!session) redirect("/account");
  const { customer } = session;

  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref.trim() : "";

  const order = await prisma.order.findFirst({
    where: ref ? { ref, email: customer.email } : { email: customer.email },
    orderBy: { placedAt: "desc" },
    include: { items: true },
  });

  // Empty state — signed in but no matching order.
  if (!order) {
    return (
      <main id="main" className="has-fixed-nav">
        <section className="section">
          <div className="container" style={{ maxWidth: 920 }}>
            <nav aria-label="Breadcrumb">
              <ol className="breadcrumb" style={{ fontSize: ".75rem", marginBottom: 16 }}>
                <li className="breadcrumb-item"><Link href="/account">My account</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Orders</li>
              </ol>
            </nav>
            <span className="eyebrow">ORDER</span>
            <h1 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)" }}>No orders yet</h1>
            <p style={{ color: "var(--text-muted)", margin: "8px 0 20px" }}>
              When you place your first order it will appear here with live delivery tracking.
            </p>
            <Link href="/shop" className="btn btn-gold">Shop the collection</Link>
          </div>
        </section>
      </main>
    );
  }

  // Money / membership maths from live order fields.
  const subtotal = Number(order.subtotal);
  const shipping = Number(order.shipping);
  const total = Number(order.total);
  // total = (subtotal − memberDiscount) + shipping  ⇒  memberDiscount derived.
  const memberDiscount = Math.max(0, Math.round((subtotal + shipping - total) * 100) / 100);
  const currency = order.currency || "GBP";

  const tier = customer.membershipTierId
    ? await prisma.membershipTier.findUnique({ where: { id: customer.membershipTierId } })
    : null;
  const discountPct = tier?.memberDiscountPct ?? 0;

  // Product thumbnails by productId (OrderItem stores no image).
  const productIds = order.items.map((i) => i.productId).filter((x): x is string => !!x);
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, imageUrl: true } })
    : [];
  const imageById = new Map(products.map((p) => [p.id, p.imageUrl]));

  // Variant descriptor line ("Charcoal · Size L"), matching the source's
  // middle item line. OrderItem stores no copy, so we rebuild it from the
  // live variant when one is linked.
  const variantIds = order.items.map((i) => i.variantId).filter((x): x is string => !!x);
  const variants = variantIds.length
    ? await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, name: true, colourName: true, size: true },
      })
    : [];
  const variantSubtitle = new Map(
    variants.map((v) => {
      const parts = [v.name, v.colourName, v.size ? `Size ${v.size}` : null].filter(Boolean);
      return [v.id, parts.join(" · ")] as const;
    }),
  );

  const placed = new Date(order.placedAt);
  const addr = (order.shippingAddress as Addr | null) ?? null;
  const recipient = order.customerName || addr?.name || [customer.firstName, customer.lastName].filter(Boolean).join(" ");

  const activeIndex = order.status === "cancelled" ? -1 : STATUS_INDEX[order.status] ?? 0;
  const statusLabel = STATUS_LABEL[order.status] ?? order.status;

  // Payment line ("Paid by … · Earned N points").
  const payLabel = order.paymentMethod
    ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)
    : "card";

  return (
    <main id="main" className="has-fixed-nav">
      <section className="section">
        <div className="container" style={{ maxWidth: 920 }}>
          <nav aria-label="Breadcrumb">
            <ol className="breadcrumb" style={{ fontSize: ".75rem", marginBottom: 16 }}>
              <li className="breadcrumb-item"><Link href="/account">My account</Link></li>
              <li className="breadcrumb-item"><Link href="/account#orders">Orders</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Order {order.ref}</li>
            </ol>
          </nav>

          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
            <div>
              <span className="eyebrow">ORDER</span>
              <h1 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)" }}>{order.ref}</h1>
              <p style={{ color: "var(--text-muted)", margin: "4px 0 0" }}>
                Placed <time dateTime={placed.toISOString()}>{fmtDate(placed)}</time>
              </p>
            </div>
            <span className="badge-brand badge-gold" style={{ fontSize: ".75rem", padding: "8px 14px" }}>
              {statusLabel}
            </span>
          </div>

          <div className="row g-4">
            {/* Items */}
            <div className="col-12 col-lg-8">
              <div className="card-brand mb-3">
                <h2 className="h5 mb-3" style={{ fontFamily: "var(--serif)" }}>Items in this order</h2>
                <div>
                  {order.items.map((item, idx) => {
                    const img = item.productId ? imageById.get(item.productId) : null;
                    const subtitle = item.variantId ? variantSubtitle.get(item.variantId) : null;
                    const isLast = idx === order.items.length - 1;
                    return (
                      <div
                        key={item.id}
                        className="d-flex align-items-center gap-3 py-3"
                        style={isLast ? undefined : { borderBottom: "1px solid var(--gold-bdr)" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img ?? "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"}
                          alt=""
                          style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                        />
                        <div className="flex-grow-1">
                          <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                          {subtitle && (
                            <p style={{ fontSize: ".8125rem", color: "var(--text-muted)", margin: 0 }}>{subtitle}</p>
                          )}
                          <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: "2px 0 0" }}>
                            Qty: {item.qty}
                          </p>
                        </div>
                        <span className="price" style={{ fontSize: "1.1rem" }}>
                          {formatMoney(Number(item.lineTotal), currency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking */}
              <div className="card-brand">
                <h2 className="h5 mb-3" style={{ fontFamily: "var(--serif)" }}>Delivery progress</h2>
                {order.status === "cancelled" ? (
                  <p style={{ color: "var(--text-muted)", margin: 0 }}>This order was cancelled.</p>
                ) : (
                  <div className="order-timeline">
                    {STEPS.map((step, i) => {
                      const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "future";
                      const dim = state === "future";
                      return (
                        <div key={step.key} className={`order-step ${state}`}>
                          <h3
                            style={{
                              fontFamily: "var(--sans)",
                              fontSize: ".95rem",
                              fontWeight: 600,
                              marginBottom: 2,
                              color: dim ? "var(--text-dim)" : "var(--text)",
                            }}
                          >
                            {step.title}
                          </h3>
                          <p style={{ fontSize: ".8125rem", margin: 0, color: dim ? "var(--text-dim)" : "var(--text-muted)" }}>
                            {state === "done" ? "Completed" : state === "active" ? "In progress" : "Pending"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="col-12 col-lg-4">
              <div className="card-brand mb-3">
                <h2 className="h5 mb-3" style={{ fontFamily: "var(--serif)" }}>Order summary</h2>
                <div className="d-flex justify-content-between py-1" style={{ fontSize: ".875rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                  <span>{formatMoney(subtotal, currency)}</span>
                </div>
                {memberDiscount > 0 && (
                  <div className="d-flex justify-content-between py-1" style={{ fontSize: ".875rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>
                      Member discount{discountPct ? ` (${discountPct}%)` : ""}
                    </span>
                    <span style={{ color: "var(--green)" }}>−{formatMoney(memberDiscount, currency)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-1" style={{ fontSize: ".875rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Shipping</span>
                  <span>{shipping > 0 ? formatMoney(shipping, currency) : "Free"}</span>
                </div>
                <div
                  className="d-flex justify-content-between pt-2 mt-2"
                  style={{ borderTop: "1px solid var(--gold-bdr)", fontWeight: 600 }}
                >
                  <span>Total paid</span>
                  <span style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--gold-hi)" }}>
                    {formatMoney(total, currency)}
                  </span>
                </div>
                <p style={{ fontSize: ".6875rem", color: "var(--text-dim)", margin: "14px 0 0" }}>
                  Paid by {payLabel} · Earned {order.pointsEarned} points
                </p>
              </div>

              <div className="card-brand mb-3">
                <h2 className="h5 mb-2" style={{ fontFamily: "var(--serif)" }}>Delivery to</h2>
                <address style={{ fontStyle: "normal", fontSize: ".875rem", margin: 0, color: "var(--text-muted)" }}>
                  {recipient && (<>{recipient}<br /></>)}
                  {addr?.line1 && (<>{addr.line1}<br /></>)}
                  {addr?.line2 && (<>{addr.line2}<br /></>)}
                  {[addr?.city, addr?.postcode].filter(Boolean).join(" ")}
                  {(addr?.city || addr?.postcode) && <br />}
                  {addr?.country || "United Kingdom"}
                </address>
                {order.deliveryMethod && (
                  <p style={{ fontSize: ".75rem", color: "var(--text-dim)", margin: "10px 0 0" }}>
                    {order.deliveryMethod === "express" ? "Express delivery" : "Standard delivery"} · Signature required (18+)
                  </p>
                )}
              </div>

              <div className="card-brand">
                <h2 className="h5 mb-2" style={{ fontFamily: "var(--serif)" }}>Need help?</h2>
                <p style={{ fontSize: ".875rem", marginBottom: 10 }}>
                  Something not right? Contact us within 1 hour of placing the order to make changes.
                </p>
                <Link href="/contact" className="btn btn-ghost btn-sm w-100">Contact support</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
