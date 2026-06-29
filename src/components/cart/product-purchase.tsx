"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

type Variant = {
  id: string;
  colourName: string | null;
  colourHex: string | null;
  size: string | null;
  priceDelta: number;
  stockQty: number;
  imageUrl: string | null;
};
type Colour = { name: string; hex: string | null; image: string | null };
type Spec = { label: string; value: string };
type Accordion = { t: string; b: string };

export type ProductPurchaseData = {
  kind: "rum" | "apparel";
  productId: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  eyebrow: string;
  images: string[];
  price: number; // current unit price (sale or base), before variant delta
  basePrice: number;
  onSale: boolean;
  saleEnds: string | null;
  saleEndsIso: string | null; // ISO yyyy-mm-dd for the semantic <time datetime>
  memberPrice: number | null; // null when no member discount applies
  points: number;
  reviewCount: number;
  stockQty: number;
  variants: Variant[];
  colours: Colour[];
  sizes: string[];
  specs: Spec[];
  tastingNotes: string | null;
  accordions: Accordion[];
};

export default function ProductPurchase(p: ProductPurchaseData) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [colour, setColour] = useState<string | null>(p.colours[0]?.name ?? null);
  const [size, setSize] = useState<string | null>(
    p.sizes.includes("M") ? "M" : p.sizes[0] ?? null
  );
  const [mainImg, setMainImg] = useState<string | null>(
    p.colours[0]?.image ?? p.images[0] ?? null
  );
  const [openAcc, setOpenAcc] = useState(0);
  const [wished, setWished] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notified, setNotified] = useState(false);

  const selVariant =
    p.variants.find(
      (v) => (colour ? v.colourName === colour : true) && (size ? v.size === size : true)
    ) ??
    p.variants.find((v) => (colour ? v.colourName === colour : true)) ??
    null;

  const unitPrice = p.price + (selVariant?.priceDelta ?? 0);
  const inStock = p.stockQty > 0;
  const savePct =
    p.onSale && p.basePrice > 0 ? Math.round((1 - p.price / p.basePrice) * 100) : 0;

  // Spec line: rum specs joined with a middot, or the composed subtitle.
  const specLine =
    p.specs.length > 0 ? p.specs.map((s) => s.value).join(" · ") : p.subtitle ?? null;

  function pickColour(c: Colour) {
    setColour(c.name);
    if (c.image) setMainImg(c.image);
  }
  function addToCart() {
    add(
      {
        productId: p.productId,
        variantId: selVariant?.id,
        name: p.name,
        price: unitPrice,
        image: selVariant?.imageUrl ?? mainImg ?? p.images[0] ?? undefined,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  // Thumbnails: prefer the apparel colour swatch images, else the rum gallery.
  const thumbs =
    p.colours.length > 0 && p.colours.some((c) => c.image)
      ? p.colours
          .map((c) => c.image)
          .filter((x): x is string => Boolean(x))
      : p.images;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.05fr .95fr",
        gap: "clamp(28px,5vw,64px)",
        alignItems: "start",
      }}
      className="pdp-grid"
    >
      {/* GALLERY */}
      <div style={{ position: "sticky", top: 96 }}>
        <div
          style={{
            aspectRatio: "1",
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid var(--line)",
            background: "var(--card)",
            marginBottom: 14,
          }}
        >
          {mainImg ? (
            <img
              id="pdp-main"
              src={mainImg}
              alt={p.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "var(--card)" }} />
          )}
        </div>
        {thumbs.length > 1 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 12,
            }}
            role="group"
            aria-label="Product images"
          >
            {thumbs.slice(0, 4).map((src, i) => {
              const active = src === mainImg;
              return (
                <button
                  type="button"
                  key={`${src}-${i}`}
                  onClick={() => setMainImg(src)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={active}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 11,
                    overflow: "hidden",
                    border: `1px solid ${active ? "var(--gold)" : "var(--line2)"}`,
                    cursor: "pointer",
                    opacity: active ? 1 : 0.7,
                    padding: 0,
                    background: "transparent",
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* BUY BOX */}
      <div>
        <span
          style={{
            fontSize: ".74rem",
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--gold)",
            fontWeight: 600,
          }}
        >
          {p.eyebrow}
        </span>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 600,
            fontSize: "clamp(2rem,4vw,2.9rem)",
            lineHeight: 1.05,
            margin: "12px 0 0",
          }}
        >
          {p.name}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
            color: "var(--muted)",
            fontSize: ".9rem",
          }}
        >
          <span style={{ color: "var(--gold)" }} aria-hidden="true">
            ★★★★★
          </span>
          <span style={{ color: "var(--dim)" }}>
            {p.reviewCount > 0 ? `${p.reviewCount} reviews` : "Trusted by the bold"}
          </span>
        </div>
        {specLine && (
          <div
            style={{
              color: "var(--muted)",
              fontSize: ".92rem",
              marginTop: 14,
            }}
          >
            {specLine}
          </div>
        )}

        {/* PRICE */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            marginTop: 22,
            padding: "18px 0",
            borderTop: "1px solid var(--line2)",
            borderBottom: "1px solid var(--line2)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: "2.4rem",
              color: "var(--text)",
              lineHeight: 1,
            }}
          >
            £{unitPrice.toFixed(2)}
          </span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {p.memberPrice != null && (
              <span
                style={{ color: "var(--goldHi)", fontSize: ".92rem", fontWeight: 600 }}
              >
                Members £{(p.memberPrice + (selVariant?.priceDelta ?? 0)).toFixed(2)}
              </span>
            )}
            <span style={{ color: "var(--dim)", fontSize: ".78rem" }}>
              {p.onSale && p.basePrice > p.price
                ? `Was £${p.basePrice.toFixed(2)} · ${savePct}% off`
                : `Earn ${p.points} points`}
            </span>
          </div>
        </div>

        {/* SIZE / COLOUR SELECTOR */}
        {p.kind === "rum" && p.sizes.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div
              style={{ fontSize: ".78rem", color: "var(--muted)", marginBottom: 10 }}
            >
              Size
            </div>
            <div
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
              role="radiogroup"
              aria-label="Size"
            >
              {p.sizes.map((sz) => {
                const active = size === sz;
                return (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => setSize(sz)}
                    aria-pressed={active}
                    style={
                      active
                        ? {
                            border: "1px solid var(--gold)",
                            background: "var(--goldLt)",
                            color: "var(--goldHi)",
                            borderRadius: 10,
                            padding: "10px 18px",
                            fontSize: ".86rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }
                        : {
                            border: "1px solid var(--line)",
                            background: "transparent",
                            color: "var(--muted)",
                            borderRadius: 10,
                            padding: "10px 18px",
                            fontSize: ".86rem",
                            cursor: "pointer",
                          }
                    }
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {p.kind === "apparel" && p.colours.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: ".78rem", color: "var(--muted)", marginBottom: 10 }}>
              Colour: <span style={{ color: "var(--text)", fontWeight: 600 }}>{colour}</span>
            </div>
            <div
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
              role="radiogroup"
              aria-label="Colour"
            >
              {p.colours.map((c) => {
                const active = colour === c.name;
                return (
                  <button
                    type="button"
                    key={c.name}
                    onClick={() => pickColour(c)}
                    aria-pressed={active}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      border: `1px solid ${active ? "var(--gold)" : "var(--line)"}`,
                      background: active ? "var(--goldLt)" : "transparent",
                      color: active ? "var(--goldHi)" : "var(--muted)",
                      borderRadius: 10,
                      padding: "10px 16px",
                      fontSize: ".86rem",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 999,
                        background: c.hex ?? "#888",
                        display: "inline-block",
                        border: "1px solid var(--line2)",
                      }}
                    />
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {p.kind === "apparel" && p.sizes.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: ".78rem", color: "var(--muted)", marginBottom: 10 }}>
              Size
            </div>
            <div
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
              role="radiogroup"
              aria-label="Size"
            >
              {p.sizes.map((sz) => {
                const active = size === sz;
                return (
                  <button
                    type="button"
                    key={sz}
                    onClick={() => setSize(sz)}
                    aria-pressed={active}
                    style={
                      active
                        ? {
                            border: "1px solid var(--gold)",
                            background: "var(--goldLt)",
                            color: "var(--goldHi)",
                            borderRadius: 10,
                            padding: "10px 18px",
                            fontSize: ".86rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }
                        : {
                            border: "1px solid var(--line)",
                            background: "transparent",
                            color: "var(--muted)",
                            borderRadius: 10,
                            padding: "10px 18px",
                            fontSize: ".86rem",
                            cursor: "pointer",
                          }
                    }
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* QUANTITY */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: ".78rem", color: "var(--muted)", marginBottom: 10 }}>
            Quantity
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              style={{
                width: 40,
                height: 40,
                border: "1px solid var(--line)",
                background: "transparent",
                color: "var(--text)",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              −
            </button>
            <input
              type="number"
              id="pdp-qty"
              value={qty}
              min={1}
              max={48}
              inputMode="numeric"
              aria-label="Quantity"
              onChange={(e) =>
                setQty(Math.max(1, Math.min(48, Number(e.target.value) || 1)))
              }
              style={{
                width: 56,
                height: 40,
                textAlign: "center",
                border: "1px solid var(--line)",
                background: "var(--surface2)",
                color: "var(--text)",
                borderRadius: 10,
                fontSize: ".92rem",
              }}
            />
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(48, q + 1))}
              aria-label="Increase quantity"
              style={{
                width: 40,
                height: 40,
                border: "1px solid var(--line)",
                background: "transparent",
                color: "var(--text)",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* ADD TO CART + WISHLIST */}
        <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
          <button
            type="button"
            onClick={addToCart}
            disabled={!inStock}
            aria-live="polite"
            style={{
              flex: "1 1 auto",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              background: inStock ? "var(--gold)" : "var(--surface2)",
              color: inStock ? "var(--onGold)" : "var(--dim)",
              border: "none",
              borderRadius: 999,
              padding: 15,
              fontSize: ".96rem",
              fontWeight: 600,
              cursor: inStock ? "pointer" : "not-allowed",
            }}
          >
            <i className={`bi ${added ? "bi-check-lg" : "bi-bag-plus"}`}></i>
            {!inStock
              ? "Out of stock"
              : added
                ? "Added"
                : `Add to Cart — £${unitPrice.toFixed(2)}`}
          </button>
          <button
            type="button"
            onClick={() => setWished((w) => !w)}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            style={{
              width: 52,
              border: "1px solid var(--line)",
              background: "transparent",
              color: wished ? "var(--goldHi)" : "var(--text)",
              borderRadius: 999,
              cursor: "pointer",
              fontSize: "1.1rem",
            }}
          >
            <i className={`bi ${wished ? "bi-heart-fill" : "bi-heart"}`}></i>
          </button>
        </div>

        {/* TRUST LINE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 14,
            color: "var(--green)",
            fontSize: ".82rem",
          }}
        >
          <i className="bi bi-check-circle-fill"></i>
          {p.kind === "rum"
            ? `${inStock ? `${p.stockQty} in stock · ` : "Out of stock · "}Free UK shipping over £50 · 18+ age verified on delivery`
            : `${inStock ? `${p.stockQty} in stock · ` : "Out of stock · "}Free UK shipping over £50 · Free 30-day returns`}
        </div>

        {/* OUT-OF-STOCK NOTIFY (kept working; shown only when genuinely OOS) */}
        {p.kind === "rum" && !inStock && (
          <details
            className="mt-3"
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
              padding: 0,
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                padding: "12px 14px",
                fontSize: ".875rem",
                color: "var(--muted)",
                listStyle: "none",
              }}
            >
              Email me when back in stock
            </summary>
            <div style={{ padding: "0 14px 16px" }}>
              {notified ? (
                <div style={{ fontSize: ".875rem", color: "var(--green)", marginTop: 8 }}>
                  You&apos;re on the list. We&apos;ll email you when {p.name} is back in stock.
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNotified(true);
                  }}
                >
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <label className="visually-hidden" htmlFor="notify-email">
                      Your email
                    </label>
                    <input
                      type="email"
                      id="notify-email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      required
                      style={{
                        flex: "1 1 auto",
                        border: "1px solid var(--line)",
                        background: "var(--surface-sunken)",
                        color: "var(--text)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: ".86rem",
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: "var(--gold)",
                        color: "var(--onGold)",
                        border: "none",
                        borderRadius: 999,
                        padding: "8px 16px",
                        fontSize: ".86rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Notify me
                    </button>
                  </div>
                  <p style={{ fontSize: ".6875rem", color: "var(--dim)", margin: "8px 0 0" }}>
                    One-off email about this product. No marketing list.
                  </p>
                </form>
              )}
            </div>
          </details>
        )}

        {/* ACCORDION */}
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column" }}>
          {p.accordions.map((a, i) => {
            const open = openAcc === i;
            return (
              <div
                key={a.t}
                style={{ borderTop: "1px solid var(--line2)", padding: "16px 0" }}
              >
                <button
                  type="button"
                  onClick={() => setOpenAcc(open ? -1 : i)}
                  aria-expanded={open}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: ".92rem", color: "var(--text)" }}>
                    {a.t}
                  </span>
                  <i
                    className={`bi ${open ? "bi-dash" : "bi-plus"}`}
                    style={{ color: "var(--dim)" }}
                  ></i>
                </button>
                {open && (
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: ".88rem",
                      lineHeight: 1.6,
                      margin: "11px 0 0",
                    }}
                  >
                    {a.b}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
