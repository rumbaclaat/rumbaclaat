import Link from "next/link";

export default function StatCard({
  label,
  value,
  icon,
  href,
  delta,
}: {
  label: string;
  value: string | number;
  icon?: string;
  href?: string;
  delta?: { value: string; direction: "up" | "down" };
}) {
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
    </>
  );

  if (href) {
    return (
      <Link href={href} className="admin-stat">
        {inner}
      </Link>
    );
  }
  return <div className="admin-stat">{inner}</div>;
}
