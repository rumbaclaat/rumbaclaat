import type { ReactNode } from "react";

export default function AdminCard({
  title,
  actions,
  className = "",
  bodyClassName = "",
  children,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={`admin-card ${className}`}>
      {(title || actions) && (
        <div className="admin-card-head">
          {typeof title === "string" ? <h2>{title}</h2> : title}
          {actions && <div className="admin-card-actions">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
