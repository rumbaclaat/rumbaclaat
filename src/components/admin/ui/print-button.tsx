"use client";

export default function PrintButton({ label = "Print / Save PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-gold btn-sm d-print-none" onClick={() => window.print()}>
      <i className="bi bi-printer me-1" aria-hidden="true" />{label}
    </button>
  );
}
