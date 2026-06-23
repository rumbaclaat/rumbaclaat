import Link from "next/link";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumb mb-2" style={{ fontSize: ".82rem" }}>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li
              key={`${c.label}-${i}`}
              className={`breadcrumb-item${last ? " active" : ""}`}
              aria-current={last ? "page" : undefined}
            >
              {c.href && !last ? <Link href={c.href}>{c.label}</Link> : c.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
