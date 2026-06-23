"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { StatusCell, MoneyCell, DateCell } from "@/components/admin/grid/cells";

export type OrderRow = {
  id: string;
  ref: string;
  customerName: string;
  email: string;
  items: number;
  total: number;
  status: string;
  paymentStatus: string;
  placedAt: string;
};

function RefCell(p: CustomCellRendererProps<OrderRow>) {
  const d = p.data!;
  return (
    <span className="d-inline-flex flex-column justify-content-center" style={{ height: "100%", lineHeight: 1.25 }}>
      <Link href={`/admin/orders/${d.id}`} className="gold" style={{ fontWeight: 600 }}>{d.ref}</Link>
      <span className="td-muted" style={{ fontSize: ".72rem" }}>{d.customerName || d.email}</span>
    </span>
  );
}

export default function OrdersGrid({
  rows,
  bulkStatus,
}: {
  rows: OrderRow[];
  bulkStatus: (ids: string[], status: string) => Promise<void>;
}) {
  const columnDefs = useMemo<ColDef<OrderRow>[]>(
    () => [
      { headerName: "Order", field: "ref", flex: 1.6, minWidth: 200, cellRenderer: RefCell },
      { headerName: "Email", field: "email", minWidth: 200, flex: 1.4 },
      { headerName: "Items", field: "items", minWidth: 90, maxWidth: 110 },
      { headerName: "Total", field: "total", minWidth: 120, cellRenderer: MoneyCell },
      { headerName: "Payment", field: "paymentStatus", minWidth: 130, cellRenderer: StatusCell },
      { headerName: "Status", field: "status", minWidth: 140, cellRenderer: StatusCell },
      { headerName: "Placed", field: "placedAt", minWidth: 150, cellRenderer: DateCell, sort: "desc" },
    ],
    []
  );

  return (
    <AdminGrid<OrderRow>
      rowData={rows}
      columnDefs={columnDefs}
      quickFilterPlaceholder="Search orders…"
      resultsLabel="orders"
      exportFileName="orders"
      bulkActions={[
        { label: "Mark packed", icon: "bi-box", run: (ids) => bulkStatus(ids, "packed") },
        { label: "Mark dispatched", icon: "bi-truck", run: (ids) => bulkStatus(ids, "dispatched") },
        { label: "Mark delivered", icon: "bi-check2-circle", run: (ids) => bulkStatus(ids, "delivered") },
      ]}
    />
  );
}
