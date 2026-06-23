"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { StatusCell, DateCell } from "@/components/admin/grid/cells";

export type EnquiryRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  received: string;
};

function NameCell(p: CustomCellRendererProps<EnquiryRow>) {
  const d = p.data!;
  return (
    <span className="d-inline-flex flex-column justify-content-center" style={{ height: "100%", lineHeight: 1.25 }}>
      <Link href={`/admin/enquiries/${d.id}`} className="gold">{d.name}</Link>
      <span className="td-muted" style={{ fontSize: ".72rem" }}>{d.email}</span>
    </span>
  );
}

export default function EnquiriesGrid({ rows }: { rows: EnquiryRow[] }) {
  const columnDefs = useMemo<ColDef<EnquiryRow>[]>(
    () => [
      { headerName: "Type", field: "type", minWidth: 110, maxWidth: 130 },
      { headerName: "From", field: "name", flex: 1.4, minWidth: 200, cellRenderer: NameCell },
      { headerName: "Subject", field: "subject", flex: 1.6, minWidth: 200 },
      { headerName: "Status", field: "status", minWidth: 130, cellRenderer: StatusCell },
      { headerName: "Received", field: "received", minWidth: 150, cellRenderer: DateCell, sort: "desc" },
    ],
    []
  );

  return (
    <AdminGrid<EnquiryRow>
      rowData={rows}
      columnDefs={columnDefs}
      quickFilterPlaceholder="Search enquiries…"
      resultsLabel="enquiries"
      exportFileName="enquiries"
    />
  );
}
