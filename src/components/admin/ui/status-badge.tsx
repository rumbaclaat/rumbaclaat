type Variant = "success" | "warn" | "danger" | "info" | "muted";

// Canonical status → badge-variant map, shared across every admin list/detail.
const MAP: Record<string, Variant> = {
  // success / live
  published: "success", live: "success", active: "success", paid: "success",
  approved: "success", delivered: "success", completed: "success", fulfilled: "success",
  shipped: "success", in_stock: "success", open: "success", resolved: "success",
  // in-progress / attention
  draft: "warn", pending: "warn", processing: "warn", unpaid: "warn", on_hold: "warn",
  partial: "warn", received: "warn", review: "warn", awaiting: "warn", new: "warn",
  unfulfilled: "warn", low_stock: "warn",
  // negative / terminal
  archived: "danger", denied: "danger", cancelled: "danger", canceled: "danger",
  refunded: "danger", failed: "danger", rejected: "danger", overdue: "danger",
  out_of_stock: "danger", closed: "danger", suspended: "danger",
  // neutral
  inactive: "muted", hidden: "muted", none: "muted",
};

export default function StatusBadge({
  status,
  variant,
  label,
}: {
  status?: string | null;
  variant?: Variant;
  label?: string;
}) {
  const key = (status ?? "").toLowerCase().replace(/\s+/g, "_");
  const v = variant ?? MAP[key] ?? "muted";
  const text = label ?? (status ?? "—").replace(/_/g, " ");
  return <span className={`admin-badge admin-badge--${v}`}>{text}</span>;
}
