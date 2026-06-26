import type { ReactNode } from "react";

/** Uppercase tier label that groups a dense KPI set ("Headline" / "Detail"). */
export default function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="admin-section-label">{children}</div>;
}
