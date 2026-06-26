"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "month", label: "This month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
];

/** Date-range + granularity filter for the analytics page (URL-driven). */
export default function AnalyticsFilters({
  range,
  granularity,
}: {
  range: string;
  granularity: "day" | "month";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => sp.set(k, v));
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="d-flex flex-wrap gap-3 align-items-center mb-4">
      <div className="admin-tabbar mb-0" role="group" aria-label="Date range">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`admin-tab ${range === r.key ? "active" : ""}`}
            aria-pressed={range === r.key}
            onClick={() => set({ range: r.key })}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="admin-tabbar mb-0 ms-auto" role="group" aria-label="Granularity">
        {(["day", "month"] as const).map((g) => (
          <button
            key={g}
            type="button"
            className={`admin-tab ${granularity === g ? "active" : ""}`}
            aria-pressed={granularity === g}
            onClick={() => set({ granularity: g })}
          >
            {g === "day" ? "By day" : "By month"}
          </button>
        ))}
      </div>
    </div>
  );
}
