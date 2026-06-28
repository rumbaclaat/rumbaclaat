"use client";

import type { SubscriberRow } from "./newsletter-grid";

// Header primary (single solid-gold action for this LIST page). Exports the
// current subscriber set to CSV client-side — no server action, no grid change.
function exportSubscribers(rows: SubscriberRow[]) {
  if (typeof window === "undefined") return;
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const header = ["Email", "Name", "Status", "Subscribed"];
  const body = rows.map((r) => [r.email, r.name, r.status, r.created].map(esc).join(","));
  const csv = [header.map(esc).join(","), ...body].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "newsletter.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportSubscribersButton({ rows }: { rows: SubscriberRow[] }) {
  return (
    <button type="button" className="btn btn-gold btn-sm" onClick={() => exportSubscribers(rows)}>
      <i className="bi bi-download me-1" aria-hidden="true" />Export subscribers
    </button>
  );
}
