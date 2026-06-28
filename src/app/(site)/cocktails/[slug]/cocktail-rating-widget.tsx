"use client";

import { useState } from "react";

/**
 * Presentational member-rating widget placeholder.
 * Reproduces the design's `[data-rc-rating]` star-picker block. Selecting a
 * star records the chosen value locally; persistence is wired up server-side
 * elsewhere. No real submission happens here yet (presentational per spec).
 */
export default function CocktailRatingWidget({
  average,
  count,
}: {
  average: number;
  count: number;
}) {
  const [hover, setHover] = useState(0);
  const [selected, setSelected] = useState(0);
  const active = hover || selected;

  return (
    <div
      data-rc-rating
      style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
    >
      <div
        role="radiogroup"
        aria-label="Your rating"
        style={{ display: "inline-flex", gap: 4 }}
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={selected === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(star)}
            onFocus={() => setHover(star)}
            onBlur={() => setHover(0)}
            onClick={() => setSelected(star)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: "1.75rem",
              lineHeight: 1,
              color: star <= active ? "var(--gold-hi)" : "var(--gold-bdr)",
              transition: "color .15s",
            }}
          >
            ★
          </button>
        ))}
      </div>
      <span style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
        {selected > 0 ? (
          <>Thanks for rating this cocktail.</>
        ) : (
          <>
            <span style={{ color: "var(--gold-hi)", fontWeight: 600 }}>
              ★ {average.toFixed(1)}
            </span>{" "}
            <span style={{ color: "var(--text-dim)" }}>({count})</span>
          </>
        )}
      </span>
    </div>
  );
}
