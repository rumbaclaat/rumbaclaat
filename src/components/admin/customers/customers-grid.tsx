"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { MoneyCell, DateCell } from "@/components/admin/grid/cells";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  tier: string;
  points: number;
  spend: number;
  orders: number;
  joined: string;
};

function NameCell(p: CustomCellRendererProps<CustomerRow>) {
  const d = p.data!;
  return (
    <span className="d-inline-flex flex-column justify-content-center" style={{ height: "100%", lineHeight: 1.25 }}>
      <Link href={`/admin/customers/${d.id}`} className="gold">{d.name || "—"}</Link>
      <span className="td-muted" style={{ fontSize: ".72rem" }}>{d.email}</span>
    </span>
  );
}

export default function CustomersGrid({ rows }: { rows: CustomerRow[] }) {
  const columnDefs = useMemo<ColDef<CustomerRow>[]>(
    () => [
      { headerName: "Customer", field: "name", flex: 1.8, minWidth: 220, cellRenderer: NameCell },
      { headerName: "Tier", field: "tier", minWidth: 130 },
      { headerName: "Points", field: "points", minWidth: 100 },
      { headerName: "Lifetime spend", field: "spend", minWidth: 140, cellRenderer: MoneyCell },
      { headerName: "Orders", field: "orders", minWidth: 100 },
      { headerName: "Joined", field: "joined", minWidth: 150, cellRenderer: DateCell, sort: "desc" },
    ],
    []
  );

  return (
    <AdminGrid<CustomerRow>
      rowData={rows}
      columnDefs={columnDefs}
      quickFilterPlaceholder="Search customers…"
      resultsLabel="customers"
      exportFileName="customers"
    />
  );
}
