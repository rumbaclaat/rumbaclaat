"use client";

import { useState, type ReactNode } from "react";

/**
 * Tabbed main column for the product editor — shows ONE section at a time.
 * Inactive sections are hidden (display:none) rather than unmounted, so every
 * field stays in the DOM and still submits with the form (no behaviour change).
 */
export default function ProductTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <>
      <div className="admin-tabbar" role="tablist" aria-label="Product sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            className={`admin-tab ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
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
