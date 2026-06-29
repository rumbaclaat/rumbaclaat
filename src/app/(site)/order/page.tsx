/* eslint-disable @next/next/no-img-element */
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

const eyebrowStyle: React.CSSProperties = {
  fontSize: ".74rem",
  letterSpacing: ".24em",
  textTransform: "uppercase",
  color: "var(--gold)",
  fontWeight: 600,
};

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--line2)",
  borderRadius: 16,
  padding: "26px 28px",
};

const cardTitleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontWeight: 600,
  fontSize: "1.2rem",
  margin: "0 0 18px",
  color: "var(--text)",
};

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
      <div data-screen-label="Order — empty">
        <section
          style={{
            position: "relative",
            padding: "clamp(48px,7vw,84px) clamp(20px,5vw,40px) clamp(40px,6vw,56px)",
            overflow: "hidden",
            borderBottom: "1px solid var(--line2)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(80% 70% at 50% 0%, rgba(205,181,130,.1), transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ fontSize: ".78rem", color: "var(--dim)", marginBottom: 14 }}>
              <Link href="/account" style={{ color: "var(--dim)" }}>My account</Link>{" "}
              <span style={{ opacity: 0.5 }}>/</span>{" "}
              <span style={{ color: "var(--muted)" }}>Orders</span>
            </div>
            <span style={eyebrowStyle}>Order</span>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 600,
                fontSize: "clamp(2rem,4.4vw,3rem)",
                lineHeight: 1.05,
                margin: "12px 0 0",
                color: "var(--text)",
              }}
            >
              No orders yet
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "1.02rem", lineHeight: 1.6, margin: "14px 0 22px", maxWidth: 520 }}>
              When you place your first order it will appear here with live delivery tracking.
            </p>
            <Link
              href="/shop"
              style={{
                display: "inline-block",
                background: "var(--gold)",
                color: "var(--onGold)",
                border: "none",
                borderRadius: 999,
                padding: "13px 30px",
                fontSize: ".92rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Shop the collection
            </Link>
          </div>
        </section>
      </div>
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
    <div data-screen-label="Order">
      {/* ---- Header band ---- */}
      <section
        style={{
          position: "relative",
          padding: "clamp(40px,6vw,72px) clamp(20px,5vw,40px) clamp(28px,4vw,40px)",
          overflow: "hidden",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(80% 70% at 50% 0%, rgba(205,181,130,.1), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: ".78rem", color: "var(--dim)", marginBottom: 14 }}>
            <Link href="/account" style={{ color: "var(--dim)" }}>My account</Link>{" "}
            <span style={{ opacity: 0.5 }}>/</span>{" "}
            <Link href="/account#orders" style={{ color: "var(--dim)" }}>Orders</Link>{" "}
            <span style={{ opacity: 0.5 }}>/</span>{" "}
            <span style={{ color: "var(--muted)" }}>Order {order.ref}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <span style={eyebrowStyle}>Order</span>
              <h1
                style={{
                  fontFamily: "var(--serif)",
                  fontWeight: 600,
                  fontSize: "clamp(2rem,4.4vw,3rem)",
                  lineHeight: 1.05,
                  margin: "12px 0 0",
                  color: "var(--text)",
                }}
              >
                {order.ref}
              </h1>
              <p style={{ color: "var(--muted)", fontSize: ".95rem", margin: "8px 0 0" }}>
                Placed <time dateTime={placed.toISOString()}>{fmtDate(placed)}</time>
              </p>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--goldLt)",
                border: "1px solid var(--gold)",
                color: "var(--goldHi)",
                borderRadius: 999,
                padding: "8px 16px",
                fontSize: ".8rem",
                fontWeight: 600,
                letterSpacing: ".04em",
              }}
            >
              <i className="bi bi-truck" />
              {statusLabel}
            </span>
          </div>
        </div>
      </section>

      {/* ---- Body ---- */}
      <section style={{ padding: "clamp(32px,5vw,52px) clamp(20px,5vw,40px) clamp(56px,8vw,96px)" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Main column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Items */}
            <div style={cardStyle}>
              <h2 style={cardTitleStyle}>Items in this order</h2>
              <div>
                {order.items.map((item, idx) => {
                  const img = item.productId ? imageById.get(item.productId) : null;
                  const subtitle = item.variantId ? variantSubtitle.get(item.variantId) : null;
                  const isLast = idx === order.items.length - 1;
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "16px 0",
                        borderBottom: isLast ? "none" : "1px solid var(--line2)",
                      }}
                    >
                      <img
                        src={img ?? "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"}
                        alt=""
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 10,
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "1px solid var(--line2)",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: "var(--text)", fontSize: ".96rem" }}>{item.name}</p>
                        {subtitle && (
                          <p style={{ fontSize: ".84rem", color: "var(--muted)", margin: "2px 0 0" }}>{subtitle}</p>
                        )}
                        <p style={{ fontSize: ".78rem", color: "var(--dim)", margin: "2px 0 0" }}>Qty: {item.qty}</p>
                      </div>
                      <span style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: "1.1rem", color: "var(--text)" }}>
                        {formatMoney(Number(item.lineTotal), currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking */}
            <div style={cardStyle}>
              <h2 style={cardTitleStyle}>Delivery progress</h2>
              {order.status === "cancelled" ? (
                <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>This order was cancelled.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {STEPS.map((step, i) => {
                    const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "future";
                    const isLast = i === STEPS.length - 1;
                    const dotBg = state === "future" ? "transparent" : "var(--gold)";
                    const dotBorder = state === "future" ? "var(--line2)" : "var(--gold)";
                    const lineFilled = i < activeIndex;
                    return (
                      <div key={step.key} style={{ display: "flex", gap: 16 }}>
                        {/* Marker + connector */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            flex: "0 0 24px",
                          }}
                        >
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              background: dotBg,
                              border: `1px solid ${dotBorder}`,
                              color: "var(--onGold)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: ".7rem",
                              flexShrink: 0,
                            }}
                          >
                            {state === "done" && <i className="bi bi-check-lg" />}
                            {state === "active" && (
                              <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--onGold)" }} />
                            )}
                          </span>
                          {!isLast && (
                            <span
                              style={{
                                width: 2,
                                flex: 1,
                                minHeight: 22,
                                background: lineFilled ? "var(--gold)" : "var(--line2)",
                              }}
                            />
                          )}
                        </div>
                        {/* Copy */}
                        <div style={{ paddingBottom: isLast ? 0 : 18 }}>
                          <h3
                            style={{
                              fontFamily: "var(--sans)",
                              fontSize: ".95rem",
                              fontWeight: 600,
                              margin: 0,
                              color: state === "future" ? "var(--dim)" : "var(--text)",
                            }}
                          >
                            {step.title}
                          </h3>
                          <p
                            style={{
                              fontSize: ".82rem",
                              margin: "2px 0 0",
                              color: state === "active" ? "var(--goldHi)" : "var(--dim)",
                            }}
                          >
                            {state === "done" ? "Completed" : state === "active" ? "In progress" : "Pending"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Order summary */}
            <div style={cardStyle}>
              <h2 style={cardTitleStyle}>Order summary</h2>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: ".88rem" }}>
                <span style={{ color: "var(--muted)" }}>Subtotal</span>
                <span style={{ color: "var(--text)" }}>{formatMoney(subtotal, currency)}</span>
              </div>
              {memberDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: ".88rem" }}>
                  <span style={{ color: "var(--muted)" }}>
                    Member discount{discountPct ? ` (${discountPct}%)` : ""}
                  </span>
                  <span style={{ color: "var(--green)" }}>−{formatMoney(memberDiscount, currency)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: ".88rem" }}>
                <span style={{ color: "var(--muted)" }}>Shipping</span>
                <span style={{ color: "var(--text)" }}>{shipping > 0 ? formatMoney(shipping, currency) : "Free"}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--line2)",
                  paddingTop: 14,
                  marginTop: 10,
                  fontWeight: 600,
                }}
              >
                <span style={{ color: "var(--text)" }}>Total paid</span>
                <span style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: "var(--goldHi)" }}>
                  {formatMoney(total, currency)}
                </span>
              </div>
              <p style={{ fontSize: ".72rem", color: "var(--dim)", margin: "16px 0 0" }}>
                Paid by {payLabel} · Earned {order.pointsEarned} points
              </p>
            </div>

            {/* Delivery to */}
            <div style={cardStyle}>
              <h2 style={{ ...cardTitleStyle, marginBottom: 14 }}>Delivery to</h2>
              <address style={{ fontStyle: "normal", fontSize: ".88rem", margin: 0, color: "var(--muted)", lineHeight: 1.65 }}>
                {recipient && (<>{recipient}<br /></>)}
                {addr?.line1 && (<>{addr.line1}<br /></>)}
                {addr?.line2 && (<>{addr.line2}<br /></>)}
                {[addr?.city, addr?.postcode].filter(Boolean).join(" ")}
                {(addr?.city || addr?.postcode) && <br />}
                {addr?.country || "United Kingdom"}
              </address>
              {order.deliveryMethod && (
                <p style={{ fontSize: ".76rem", color: "var(--dim)", margin: "12px 0 0", lineHeight: 1.5 }}>
                  {order.deliveryMethod === "express" ? "Express delivery" : "Standard delivery"} · Signature required (18+)
                </p>
              )}
            </div>

            {/* Need help */}
            <div style={cardStyle}>
              <h2 style={{ ...cardTitleStyle, marginBottom: 12 }}>Need help?</h2>
              <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
                Something not right? Contact us within 1 hour of placing the order to make changes.
              </p>
              <Link
                href="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  width: "100%",
                  background: "transparent",
                  border: "1px solid var(--gold)",
                  color: "var(--goldHi)",
                  borderRadius: 999,
                  padding: "12px 24px",
                  fontSize: ".9rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Contact support <i className="bi bi-arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
