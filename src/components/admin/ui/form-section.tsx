import type { ReactNode } from "react";

export default function FormSection({
  title,
  description,
  grid = true,
  children,
}: {
  title: string;
  description?: string;
  /** wrap children in a Bootstrap `.row g-3` (default). Set false for custom layouts. */
  grid?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="admin-form-section">
      <div className="admin-form-section-head">
        <h2 className="admin-form-section-title">{title}</h2>
        {description && <p className="admin-form-section-desc">{description}</p>}
      </div>
      {grid ? <div className="row g-3">{children}</div> : children}
    </section>
  );
}
