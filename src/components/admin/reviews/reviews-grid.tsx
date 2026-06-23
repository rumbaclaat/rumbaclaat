"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { StatusCell, DateCell, RowActionsCell } from "@/components/admin/grid/cells";

export type ReviewRow = { id: string; product: string; author: string; rating: number; title: string; status: string; featured: string; created: string };

function StarsCell(p: CustomCellRendererProps<ReviewRow>) {
  const n = Number(p.value) || 0;
  return <span style={{ color: "var(--gold-hi)" }}>{"★".repeat(n)}<span style={{ color: "var(--text-dim)" }}>{"★".repeat(5 - n)}</span></span>;
}

export default function ReviewsGrid({
  rows,
  bulkStatus,
  deleteAction,
}: {
  rows: ReviewRow[];
  bulkStatus: (ids: string[], status: string) => Promise<void>;
  deleteAction: (fd: FormData) => void | Promise<void>;
}) {
  const columnDefs = useMemo<ColDef<ReviewRow>[]>(
    () => [
      { headerName: "Product", field: "product", flex: 1.4, minWidth: 160 },
      { headerName: "Rating", field: "rating", width: 130, cellRenderer: StarsCell },
      { headerName: "Title", field: "title", flex: 1.4, minWidth: 160 },
      { headerName: "Author", field: "author", minWidth: 140 },
      { headerName: "Status", field: "status", width: 130, cellRenderer: StatusCell },
      { headerName: "Featured", field: "featured", width: 110 },
      { headerName: "Date", field: "created", width: 150, cellRenderer: DateCell, sort: "desc" },
      {
        headerName: "", field: "id", sortable: false, filter: false, resizable: false, minWidth: 90, maxWidth: 110,
        cellRenderer: RowActionsCell,
        cellRendererParams: { deleteAction, getDeleteFields: (d: ReviewRow) => ({ id: d.id }), getConfirmLabel: () => "Delete this review?" },
      },
    ],
    [deleteAction]
  );

  return (
    <AdminGrid<ReviewRow>
      rowData={rows}
      columnDefs={columnDefs}
      quickFilterPlaceholder="Search reviews…"
      resultsLabel="reviews"
      exportFileName="reviews"
      bulkActions={[
        { label: "Approve", icon: "bi-check2", run: (ids) => bulkStatus(ids, "live") },
        { label: "Reject", icon: "bi-x", danger: true, run: (ids) => bulkStatus(ids, "denied") },
      ]}
    />
  );
}
