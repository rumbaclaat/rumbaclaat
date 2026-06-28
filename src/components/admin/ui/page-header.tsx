import type { ReactNode } from "react";
import Breadcrumbs, { type Crumb } from "./breadcrumbs";

export default function PageHeader({
  title,
  titleBadge,
  subtitle,
  breadcrumb,
  action,
}: {
  title: string;
  titleBadge?: ReactNode; // status badge(s) rendered inline next to the H1 (DETAIL pattern)
  subtitle?: string;
  breadcrumb?: Crumb[];
  action?: ReactNode;
}) {
  return (
    <>
      {breadcrumb && <Breadcrumbs items={breadcrumb} />}
      <div className="admin-page-head">
        <div>
          {titleBadge ? (
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h1 style={{ margin: 0 }}>{title}</h1>
              {titleBadge}
            </div>
          ) : (
            <h1>{title}</h1>
          )}
          {subtitle && <div className="admin-page-sub">{subtitle}</div>}
        </div>
        {action && <div className="admin-page-actions">{action}</div>}
      </div>
    </>
  );
}
