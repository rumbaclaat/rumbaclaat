"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

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

import { useCart } from "@/components/cart/cart-provider";

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

  // Try to read structured NOSE / PALATE / FINISH tasting notes out of the
  // free-text tastingNotes field (e.g. "Nose: …; Palate: …; Finish: …").
  // When found we render them as three labelled spec cells matching the
  // static-source rum design; otherwise we fall back to the live spec cells
  // (ABV / AGE / ORIGIN) plus a labelled tasting paragraph.
  function parseTasting(notes: string | null): { label: string; value: string }[] {
    if (!notes) return [];
    const out: { label: string; value: string }[] = [];
    for (const label of ["Nose", "Palate", "Finish"] as const) {
      const m = notes.match(new RegExp(`${label}\\s*[:\\-–—]\\s*([^;|\\n]+)`, "i"));
      if (m) out.push({ label: label.toUpperCase(), value: m[1].trim().replace(/[.;]+$/, "") });
    }
    return out.length === 3 ? out : [];
  }
  const tasting = p.kind === "rum" ? parseTasting(p.tastingNotes) : [];

  function pickColour(c: Colour) {
    setColour(c.name);
    if (c.image) setMainImg(c.image);
  }
  function clampQty(n: number) {
    return Math.max(1, Math.min(48, n));
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

  return (
    <div className="row g-5">
      {/* Gallery */}
      <div className="col-12 col-lg-6">
        <div style={{ position: "sticky", top: 96 }}>
          <div className="gallery-main mb-3">
            {mainImg ? (
              <img id="pdp-main" src={mainImg} alt={p.name} />
            ) : (
              <div style={{ width: "100%", height: "100%", background: "var(--bg-card)" }} />
            )}
          </div>
          {p.kind === "rum" && p.images.length > 1 && (
            <div className="row g-2" role="group" aria-label="Product images">
              {p.images.slice(0, 4).map((src, i) => (
                <div className="col-3" key={i}>
                  <button
                    type="button"
                    className={`thumb w-100${src === mainImg ? " active" : ""}`}
                    onClick={() => setMainImg(src)}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={src} alt="" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info / buy box */}
      <div className="col-12 col-lg-6">
        <span className="eyebrow">{p.eyebrow}</span>
        <h1 style={{ fontSize: "clamp(2rem,4vw,2.75rem)" }}>{p.name}</h1>
        {p.subtitle && (
          <p className="subtitle" style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
            {p.subtitle}
          </p>
        )}

        <div className="d-flex align-items-center gap-2 mt-2 mb-3">
          <span className="stars" aria-hidden="true">★★★★★</span>
          <span style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
            {p.reviewCount > 0 ? `${p.reviewCount} reviews` : "Trusted by the bold"}
          </span>
          {inStock && (
            <span
              className="badge-brand"
              style={{
                color: "var(--green)",
                borderColor: "rgba(74,222,128,.3)",
                background: "rgba(74,222,128,.1)",
              }}
            >
              In stock
            </span>
          )}
        </div>

        {/* Price */}
        <div className="mb-2">
          {p.onSale ? (
            <span className="price-pair large">
              <span className="visually-hidden">Sale price</span>
              <span className="price-sale">£{unitPrice.toFixed(2)}</span>
              <span className="visually-hidden">Regular price</span>
              <span className="price-regular">£{p.basePrice.toFixed(2)}</span>
              <span className="price-saving">
                Save £{(p.basePrice - p.price).toFixed(2)} ({savePct}% off)
              </span>
            </span>
          ) : (
            <span className="price" style={{ fontSize: "2rem" }}>
              £{unitPrice.toFixed(2)}
            </span>
          )}
          {p.memberPrice != null && (
            <div style={{ marginTop: 6 }}>
              <span className="price-member" style={{ fontSize: ".9rem" }}>
                Members from £{(p.memberPrice + (selVariant?.priceDelta ?? 0)).toFixed(2)} · earn{" "}
                {p.points} pts
              </span>
            </div>
          )}
          {p.onSale && p.saleEnds && (
            <span className="sale-ends">
              Sale ends{" "}
              {p.saleEndsIso ? <time dateTime={p.saleEndsIso}>{p.saleEnds}</time> : p.saleEnds}
            </span>
          )}
        </div>

        {p.description && <p style={{ margin: "14px 0 20px" }}>{p.description}</p>}

        {/* Rum tasting notes / specs.
            When structured NOSE / PALATE / FINISH notes are available we show the
            three labelled tasting cells exactly as in the static-source design.
            Otherwise we keep the live ABV / AGE / ORIGIN spec cells and, where a
            free-text tasting note exists, also surface a labelled tasting block. */}
        {p.kind === "rum" && tasting.length === 3 ? (
          <div className="row g-2 mb-4">
            {tasting.map((s) => (
              <div className="col-4" key={s.label}>
                <div className="spec-cell">
                  <p
                    style={{
                      fontSize: ".625rem",
                      color: "var(--text-dim)",
                      marginBottom: 4,
                      letterSpacing: ".1em",
                    }}
                  >
                    {s.label}
                  </p>
                  <p style={{ fontSize: ".8rem", color: "var(--text)", margin: 0 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {p.kind === "rum" && p.specs.length > 0 && (
              <div className="row g-2 mb-4">
                {p.specs.map((s) => (
                  <div className="col-4" key={s.label}>
                    <div className="spec-cell">
                      <p
                        style={{
                          fontSize: ".625rem",
                          color: "var(--text-dim)",
                          marginBottom: 4,
                          letterSpacing: ".1em",
                        }}
                      >
                        {s.label}
                      </p>
                      <p style={{ fontSize: ".8rem", color: "var(--text)", margin: 0 }}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {p.kind === "rum" && p.tastingNotes && (
              <p style={{ margin: "0 0 20px", color: "var(--text-muted)" }}>
                <strong style={{ color: "var(--text)" }}>Tasting notes — </strong>
                {p.tastingNotes}
              </p>
            )}
          </>
        )}

        {/* Apparel: colour + size */}
        {p.kind === "apparel" && p.colours.length > 0 && (
          <fieldset className="mb-3" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="form-label" style={{ fontSize: ".8125rem" }}>
              Colour:{" "}
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{colour}</span>
            </legend>
            <div className="d-flex gap-2 flex-wrap" role="radiogroup" aria-label="Colour">
              {p.colours.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  className="swatch"
                  aria-pressed={colour === c.name}
                  onClick={() => pickColour(c)}
                  style={
                    colour === c.name
                      ? { borderColor: "var(--gold)", color: "var(--text)" }
                      : undefined
                  }
                >
                  <span className="chip" style={{ background: c.hex ?? "#888" }} />
                  {c.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {p.kind === "apparel" && p.sizes.length > 0 && (
          <fieldset className="mb-2" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="form-label" style={{ fontSize: ".8125rem" }}>
              Size
            </legend>
            <div className="d-flex gap-2 flex-wrap" role="radiogroup" aria-label="Size">
              {p.sizes.map((sz) => (
                <button
                  type="button"
                  key={sz}
                  className={`btn btn-sm ${size === sz ? "btn-gold" : "btn-outline-gold"}`}
                  aria-pressed={size === sz}
                  onClick={() => setSize(sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {p.kind === "apparel" && p.sizes.length > 0 && (
          <p style={{ fontSize: ".75rem" }}>
            <a href="#size-guide" style={{ color: "var(--gold-hi)" }}>
              View size guide
            </a>
          </p>
        )}

        {/* Quantity + add */}
        <div
          className={`d-flex align-items-end gap-3 flex-wrap ${
            p.kind === "rum" ? "mb-3" : "my-3"
          }`}
        >
          <div>
            <label className="form-label d-block" htmlFor="pdp-qty" style={{ fontSize: ".75rem" }}>
              Quantity
            </label>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQty((q) => clampQty(q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <input
                className="form-control qty-input"
                type="number"
                id="pdp-qty"
                value={qty}
                min={1}
                max={48}
                inputMode="numeric"
                onChange={(e) => setQty(clampQty(Number(e.target.value) || 1))}
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQty((q) => clampQty(q + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
          {inStock ? (
            <button
              type="button"
              className="btn btn-gold btn-lg flex-grow-1"
              style={{ minWidth: 200 }}
              onClick={addToCart}
              aria-live="polite"
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-gold btn-lg flex-grow-1"
              style={{ minWidth: 200 }}
              disabled
            >
              Out of stock
            </button>
          )}
        </div>
        <p style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>
          {p.kind === "rum"
            ? `${
                inStock ? `${p.stockQty} in stock · ` : ""
              }Free UK shipping over £50 · 18+ only, age verified on delivery.`
            : "Free UK shipping over £50 · Free 30-day returns."}
        </p>

        {/* Rum: stock-notify — "email me when back in stock".
            Faithfully reproduced from static-source/product-rum.html (the widget
            stands in for the out-of-stock state); shown only when genuinely out
            of stock. Presentational anon email form. */}
        {p.kind === "rum" && !inStock && (
          <details
            className="mt-3 stock-notify"
            style={{
              background: "var(--bg-card2)",
              border: "1px solid var(--gold-bdr)",
              borderRadius: "var(--radius)",
              padding: 0,
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                padding: "12px 14px",
                fontSize: ".875rem",
                color: "var(--text-muted)",
                listStyle: "none",
              }}
            >
              <span style={{ color: "var(--red)", fontWeight: 600 }}>●</span>{" "}
              <span style={{ color: "var(--text)" }}>Out of stock —</span>{" "}
              <span style={{ color: "var(--text-muted)" }}>email me when back in stock</span>
            </summary>
            <div style={{ padding: "0 14px 16px" }}>
              {notified ? (
                <div style={{ fontSize: ".875rem", color: "var(--green)", marginTop: 8 }}>
                  ✓ You&apos;re on the list. We&apos;ll email you when {p.name} is back in stock.
                </div>
              ) : (
                <form
                  className="stock-notify-anon"
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNotified(true);
                  }}
                >
                  <div className="d-flex gap-2 mt-2">
                    <label className="visually-hidden" htmlFor="notify-email">
                      Your email
                    </label>
                    <input
                      className="form-control form-control-sm"
                      type="email"
                      id="notify-email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-gold btn-sm"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      Notify me
                    </button>
                  </div>
                  <p style={{ fontSize: ".6875rem", color: "var(--text-dim)", margin: "8px 0 0" }}>
                    One-off email about this product. No marketing list.
                  </p>
                </form>
              )}
            </div>
          </details>
        )}

        {/* Details accordion — sits inside the info column, directly under the
            buy box (reproduced from static-source). Native <details> so it works
            without Bootstrap's collapse JS. */}
        <div className="accordion mt-4">
          {p.accordions.map((a, i) => (
            <details className="accordion-item" key={a.t} open={i === 0}>
              <summary
                className="accordion-button"
                style={{
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {a.t}
              </summary>
              <div className="accordion-body">{a.b}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
