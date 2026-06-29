"use client";

import { useState, type ReactNode } from "react";

type Item = { q: string; a: ReactNode };
type Group = { id: string; cat: string; items: Item[] };

export default function FaqAccordion({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      {groups.map((cat) => (
        <div key={cat.id} style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontWeight: 600,
              fontSize: "1.35rem",
              margin: "0 0 14px",
              color: "var(--gold)",
            }}
          >
            {cat.cat}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cat.items.map((it, i) => {
              const key = `${cat.id}-${i}`;
              const isOpen = open === key;
              return (
                <div
                  key={key}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--line2)",
                    borderRadius: 12,
                    padding: "18px 20px",
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 14,
                      cursor: "pointer",
                      width: "100%",
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      textAlign: "left",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: ".96rem",
                        color: "var(--text)",
                      }}
                    >
                      {it.q}
                    </span>
                    <i
                      className={`bi bi-${isOpen ? "chevron-up" : "chevron-down"}`}
                      style={{ color: "var(--gold)", flex: "0 0 auto" }}
                    />
                  </button>
                  {isOpen && (
                    <p
                      style={{
                        color: "var(--muted)",
                        fontSize: ".9rem",
                        lineHeight: 1.65,
                        margin: "12px 0 0",
                      }}
                    >
                      {it.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
