"use client";

import { useState } from "react";

export default function TradeTabs({
  tabs,
}: {
  tabs: { id: string; label: string; badge?: number; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);

  return (
    <>
      <ul className="nav nav-pills gap-2 my-4" role="tablist" aria-label="Trade portal sections">
        {tabs.map((t) => (
          <li className="nav-item" key={t.id} role="presentation">
            <button
              type="button"
              className={`nav-link ${active === t.id ? "active" : ""}`}
              aria-selected={active === t.id}
              onClick={() => setActive(t.id)}
            >
              {t.label}
              {t.badge ? <span className="badge-brand ms-2" style={{ fontSize: ".625rem", padding: "2px 7px" }}>{t.badge}</span> : null}
            </button>
          </li>
        ))}
      </ul>
      {tabs.map((t) => (
        <div key={t.id} hidden={active !== t.id} role="tabpanel">
          {t.content}
        </div>
      ))}
    </>
  );
}
