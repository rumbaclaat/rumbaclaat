// Global announcement ticker (Storefront Redesign.dc.html, chrome). Static chrome
// rendered once in the (site) layout under the header.
const TICKER = [
  { mark: "🎁", text: "Order by Sat 13 Dec for guaranteed UK Christmas delivery" },
  { mark: "🚚", text: "Free UK shipping over £50 — express upgrades at checkout" },
  { mark: "✦", text: "Gold Members — Spiced Tasting Night, 12 Jan, London" },
];

export default function AnnouncementTicker() {
  // Duplicated so the -50% translate loops seamlessly.
  const items = [...TICKER, ...TICKER];
  return (
    <div role="region" aria-label="Announcements" style={{ background: "var(--surface)", borderBottom: "1px solid var(--line2)", overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 40, padding: "9px 0", animation: "sfTicker 38s linear infinite", fontSize: ".76rem", letterSpacing: ".04em", color: "var(--muted)" }}>
        {items.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 10, paddingLeft: 20 }}>
            <span style={{ color: "var(--gold)" }} aria-hidden="true">{t.mark}</span>
            {t.text}
          </span>
        ))}
      </div>
    </div>
  );
}
