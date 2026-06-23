"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { MoneyCell, StatusCell } from "@/components/admin/grid/cells";

export type TradeRow = {
  id: string;
  company: string;
  contactName: string;
  contactEmail: string;
  businessType: string;
  terms: string;
  orders: number;
  outstanding: number;
  status: string;
};

function CompanyCell(p: CustomCellRendererProps<TradeRow>) {
  const d = p.data!;
  return (
    <span className="d-inline-flex flex-column justify-content-center" style={{ height: "100%", lineHeight: 1.25 }}>
      <Link href={`/admin/trade/${d.id}`} className="gold">{d.company}</Link>
      <span className="td-muted" style={{ fontSize: ".72rem" }}>{d.contactName} · {d.contactEmail}</span>
    </span>
  );
}

export default function TradeGrid({ rows }: { rows: TradeRow[] }) {
  const columnDefs = useMemo<ColDef<TradeRow>[]>(
    () => [
      { headerName: "Company", field: "company", flex: 2, minWidth: 240, cellRenderer: CompanyCell },
      { headerName: "Type", field: "businessType", minWidth: 150 },
      { headerName: "Terms", field: "terms", minWidth: 110 },
      { headerName: "Orders", field: "orders", minWidth: 100 },
      { headerName: "Outstanding", field: "outstanding", minWidth: 140, cellRenderer: MoneyCell },
      { headerName: "Status", field: "status", minWidth: 130, cellRenderer: StatusCell },
    ],
    []
  );

  return (
    <AdminGrid<TradeRow>
      rowData={rows}
      columnDefs={columnDefs}
      quickFilterPlaceholder="Search trade accounts…"
      resultsLabel="accounts"
      exportFileName="trade-accounts"
    />
  );
}
