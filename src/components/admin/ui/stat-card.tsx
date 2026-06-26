import Link from "next/link";
import type { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  icon,
  href,
  delta,
  variant,
  foot,
}: {
  label: string;
  value: string | number;
  icon?: string;
  href?: string;
  delta?: { value: string; direction: "up" | "down" };
  /** "hero" = the dominant metric; "primary" = a primary-tier card. */
  variant?: "hero" | "primary";
  /** Optional content under the number (e.g. a <Sparkline />). */
  foot?: ReactNode;
}) {
  const cls = `admin-stat${variant ? ` admin-stat--${variant}` : ""}`;
  const inner = (
    <>
      <div className="admin-stat-top">
        <span className="admin-stat-label">{label}</span>
        {icon && (
          <span className="admin-stat-icon" aria-hidden="true">
            <i className={`bi ${icon}`} />
          </span>
        )}
      </div>
      <span className="admin-stat-num">{value}</span>
      {delta && (
        <span className={`admin-stat-delta ${delta.direction}`}>
          <i className={`bi ${delta.direction === "up" ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} aria-hidden="true" />{" "}
          {delta.value}
        </span>
      )}
      {foot}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}
