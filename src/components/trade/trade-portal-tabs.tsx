"use client";

import { useState } from "react";

const pillActive: React.CSSProperties = {
  background: "var(--gold)",
  color: "var(--onGold)",
  border: "1px solid var(--gold)",
  borderRadius: 999,
  padding: "8px 18px",
  fontSize: ".82rem",
  fontWeight: 600,
  cursor: "pointer",
};
const pillIdle: React.CSSProperties = {
  background: "transparent",
  color: "var(--muted)",
  border: "1px solid var(--line2)",
  borderRadius: 999,
  padding: "8px 18px",
  fontSize: ".82rem",
  fontWeight: 600,
  cursor: "pointer",
};

export default function TradePortalTabs({
  tabs,
}: {
  tabs: { id: string; label: string; badge?: number; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }} role="tablist" aria-label="Trade portal sections">
        {tabs.map((t) => (
          <button
            type="button"
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            style={active === t.id ? pillActive : pillIdle}
          >
            {t.label}
            {t.badge ? (
              <span style={{ marginLeft: 8, background: "var(--goldLt)", border: "1px solid var(--gold-bdr)", color: "var(--goldHi)", borderRadius: 999, padding: "1px 7px", fontSize: ".68rem" }}>{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={active !== t.id}>
          {t.content}
        </div>
      ))}
    </>
  );
}
