"use client";

import { useState, type ReactNode } from "react";

export default function AdminTabs({
  tabs,
}: {
  tabs: { id: string; label: string; badge?: number; content: ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <>
      <ul className="nav nav-pills gap-2 mb-3 admin-tabs" role="tablist">
        {tabs.map((t) => (
          <li className="nav-item" key={t.id}>
            <button
              type="button"
              className={`nav-link ${active === t.id ? "active" : ""}`}
              aria-current={active === t.id ? "true" : undefined}
              onClick={() => setActive(t.id)}
            >
              {t.label}
              {t.badge ? <span className="badge-brand ms-2" style={{ fontSize: ".625rem", padding: "2px 7px" }}>{t.badge}</span> : null}
            </button>
          </li>
        ))}
      </ul>
      {tabs.map((t) => (
        <div key={t.id} hidden={active !== t.id}>
          {t.content}
        </div>
      ))}
    </>
  );
}
