"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import BrandImage from "@/components/brand-image";

/**
 * Homepage hero carousel — faithful reproduction of static-source/index.html
 * `.hero-carousel`. Two slides (Born in the Caribbean / Summer Sale), a fixed
 * crest, prev/next arrows, a tablist of dots, and a pause toggle. Auto-advances
 * every 6s unless paused or the user prefers reduced motion.
 */
const SLIDES = [
  {
    id: "hc-1",
    label: "Slide 1 of 2: Born in the Caribbean",
    dotLabel: "Slide 1: Born in the Caribbean",
    bg: "https://images.unsplash.com/photo-1758871993077-e084cc7eca86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80",
  },
  {
    id: "hc-2",
    label: "Slide 2 of 2: Summer Sale",
    dotLabel: "Slide 2: Summer Sale",
    bg: "https://images.unsplash.com/photo-1764699186296-9dac0ddb5edb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1800&q=80",
  },
] as const;

const AUTO_MS = 6000;

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => {
    setActive((i + SLIDES.length) % SLIDES.length);
  }, []);
  const next = useCallback(() => go(active + 1), [active, go]);
  const prev = useCallback(() => go(active - 1), [active, go]);

  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length);
    }, AUTO_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  return (
    <section
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Featured stories"
      id="hero-carousel"
    >
      <div className="hc-crest-fixed" aria-hidden="true">
        <BrandImage src="/brand/crest.webp" alt="" width={180} height={115} fallback={
          <span className="brand-wordmark" style={{ fontSize: "1.5rem" }}>Rumbaclaat</span>
        } />
      </div>

      <div className="hc-slides" aria-live="polite">
        {/* SLIDE 1 — Brand / flagship rum */}
        <article
          className={`hc-slide${active === 0 ? " active" : ""}`}
          id="hc-1"
          role="group"
          aria-roledescription="slide"
          aria-label={SLIDES[0].label}
        >
          <div className="hc-bg" style={{ backgroundImage: `url('${SLIDES[0].bg}')` }} />
          <div className="hc-overlay" />
          <div className="hc-content">
            <span className="hc-eyebrow">PREMIUM CARIBBEAN RUM</span>
            <h1 className="hc-h">Born in the Caribbean.<br /><em>Bottled for the Bold.</em></h1>
            <p className="hc-lede">Aged in American oak. Crafted with heritage. Rumbaclaat rum is a tribute to Caribbean culture, distilled into every drop.</p>
            <div className="hc-ctas">
              <Link href="/shop" className="btn btn-gold btn-lg">Shop Rum</Link>
              <Link href="/join" className="btn btn-outline-gold btn-lg">Join RPM</Link>
            </div>
          </div>
        </article>

        {/* SLIDE 2 — Sale */}
        <article
          className={`hc-slide${active === 1 ? " active" : ""}`}
          id="hc-2"
          role="group"
          aria-roledescription="slide"
          aria-label={SLIDES[1].label}
        >
          <div className="hc-bg" style={{ backgroundImage: `url('${SLIDES[1].bg}')` }} />
          <div className="hc-overlay" />
          <div className="hc-content">
            <span className="hc-eyebrow">SUMMER SALE — ENDS 4 JUNE</span>
            <h2 className="hc-h">Up to <em>20% off</em><br />selected rum and apparel.</h2>
            <p className="hc-lede">Spiced Gold from £31.19. Gold Label Hoodie from £80. Members keep their tier discount on top of every sale price.</p>
            <div className="hc-ctas">
              <Link href="/shop" className="btn btn-gold btn-lg">Shop the Sale</Link>
              <Link href="/shop?category=mens-apparel" className="btn btn-outline-gold btn-lg">Men&apos;s Apparel</Link>
            </div>
          </div>
        </article>
      </div>

      <button
        type="button"
        className="hc-arrow hc-prev"
        aria-label="Previous slide"
        aria-controls="hero-carousel"
        onClick={prev}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <button
        type="button"
        className="hc-arrow hc-next"
        aria-label="Next slide"
        aria-controls="hero-carousel"
        onClick={next}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
      </button>

      <div className="hc-dots" role="tablist" aria-label="Choose a slide">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className="hc-dot"
            role="tab"
            aria-current={active === i ? "true" : "false"}
            aria-controls={s.id}
            aria-label={s.dotLabel}
            onClick={() => go(i)}
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
