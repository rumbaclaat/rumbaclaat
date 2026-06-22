import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container text-center" style={{ maxWidth: 640 }}>
        <div className="serif gold" style={{ fontSize: "5rem", lineHeight: 1 }}>
          404
        </div>
        <span className="eyebrow eyebrow-center mt-3">Page not found</span>
        <h1 className="mb-3">This page got lost on the way home.</h1>
        <p style={{ color: "var(--text-muted)" }}>
          The page you&apos;re after may have moved or never existed. Let&apos;s
          get you back on track.
        </p>
        <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
          <Link href="/" className="btn btn-gold">
            Back to home
          </Link>
          <Link href="/shop" className="btn btn-outline-gold">
            Browse the shop
          </Link>
          <Link href="/contact" className="btn btn-ghost">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
