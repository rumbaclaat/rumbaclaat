import type { ReactNode } from "react";
import Breadcrumbs, { type Crumb } from "./breadcrumbs";

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  action,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: Crumb[];
  action?: ReactNode;
}) {
  return (
    <>
      {breadcrumb && <Breadcrumbs items={breadcrumb} />}
      <div className="admin-page-head">
        <div>
          <h1>{title}</h1>
          {subtitle && <div className="admin-page-sub">{subtitle}</div>}
        </div>
        {action && <div className="admin-page-actions">{action}</div>}
      </div>
    </>
  );
}
