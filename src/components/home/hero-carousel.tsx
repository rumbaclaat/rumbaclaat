"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Slide = {
  bg: string;
  eyebrow: string;
  heading: React.ReactNode;
  lede: string;
  ctas: { label: string; href: string; variant: "btn-gold" | "btn-outline-gold" }[];
};

const SLIDES: Slide[] = [
  {
    bg: "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80",
    eyebrow: "Premium Caribbean Rum",
    heading: (
      <>
        Born in the Caribbean.
        <br />
        <em>Bottled for the Bold.</em>
      </>
    ),
    lede: "Aged in American oak. Crafted with heritage. Rumbaclaat rum is a tribute to Caribbean culture, distilled into every drop.",
    ctas: [
      { label: "Shop Rum", href: "/shop", variant: "btn-gold" },
      { label: "Join the Inner Circle", href: "/join", variant: "btn-outline-gold" },
    ],
  },
  {
    bg: "https://images.unsplash.com/photo-1764699186296-9dac0ddb5edb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80",
    eyebrow: "Summer Sale — Ends 4 June",
    heading: (
      <>
        Up to <em>20% off</em>
        <br />
        selected rum and apparel.
      </>
    ),
    lede: "Spiced Gold from £31.19. Gold Label Hoodie from £80. Members keep their tier discount on top of every sale price.",
    ctas: [
      { label: "Shop the Sale", href: "/shop", variant: "btn-gold" },
      { label: "Men's Apparel", href: "/shop?category=mens-apparel", variant: "btn-outline-gold" },
    ],
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length);
    }, 6000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const go = (dir: number) =>
    setActive((a) => (a + dir + SLIDES.length) % SLIDES.length);

  return (
    <section className="hero-carousel" aria-roledescription="carousel" aria-label="Featured stories">
      <div className="hc-slides" aria-live="polite">
        {SLIDES.map((s, i) => (
          <article
            key={i}
            className={`hc-slide${i === active ? " active" : ""}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${SLIDES.length}`}
          >
            <div className="hc-bg" style={{ backgroundImage: `url('${s.bg}')` }} />
            <div className="hc-overlay" />
            <div className="hc-content">
              <span className="hc-eyebrow">{s.eyebrow}</span>
              {i === 0 ? <h1 className="hc-h">{s.heading}</h1> : <h2 className="hc-h">{s.heading}</h2>}
              <p className="hc-lede">{s.lede}</p>
              <div className="hc-ctas">
                {s.ctas.map((c) => (
                  <Link key={c.label} href={c.href} className={`btn ${c.variant} btn-lg`}>
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <button type="button" className="hc-arrow hc-prev" aria-label="Previous slide" onClick={() => go(-1)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button type="button" className="hc-arrow hc-next" aria-label="Next slide" onClick={() => go(1)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <div className="hc-dots" role="tablist" aria-label="Choose a slide">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            className="hc-dot"
            role="tab"
            aria-current={i === active}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActive(i)}
          />
        ))}
        <button
          type="button"
          className="hc-toggle"
          aria-label={paused ? "Resume auto-advance" : "Pause auto-advance"}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          )}
        </button>
      </div>
    </section>
  );
}
