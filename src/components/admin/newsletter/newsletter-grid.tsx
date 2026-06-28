"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { StatusCell, DateCell, RowActionsCell } from "@/components/admin/grid/cells";
import StatusBadge from "@/components/admin/ui/status-badge";

export type SubscriberRow = { id: string; email: string; name: string; status: string; created: string };

// First column: name+sub-line cell convention (subscriber email + status/date
// sub-line), matching the products ProductCell / customers NameCell pattern.
// Presentation only — the column still binds field "email" and keeps its
// sort/filter/flow behaviour.
function SubscriberCell(p: CustomCellRendererProps<SubscriberRow>) {
  const d = p.data!;
  const date = d.created
    ? new Date(d.created).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  return (
    <span className="d-inline-flex flex-column justify-content-center" style={{ height: "100%", lineHeight: 1.25 }}>
      <span className="d-inline-flex align-items-center gap-2">
        <span>{d.email}</span>
        <StatusBadge status={d.status} />
      </span>
      <span className="td-muted" style={{ fontSize: ".72rem" }}>Subscribed {date}</span>
    </span>
  );
}

export default function NewsletterGrid({
  rows,
  bulkStatus,
  deleteAction,
}: {
  rows: SubscriberRow[];
  bulkStatus: (ids: string[], status: string) => Promise<void>;
  deleteAction: (fd: FormData) => void | Promise<void>;
}) {
  const columnDefs = useMemo<ColDef<SubscriberRow>[]>(
    () => [
      { headerName: "Email", field: "email", flex: 2, minWidth: 220, cellRenderer: SubscriberCell },
      { headerName: "Name", field: "name", minWidth: 150 },
      { headerName: "Status", field: "status", width: 150, cellRenderer: StatusCell },
      { headerName: "Subscribed", field: "created", width: 160, cellRenderer: DateCell, sort: "desc" },
      {
        headerName: "", field: "id", sortable: false, filter: false, resizable: false, minWidth: 90, maxWidth: 110,
        cellRenderer: RowActionsCell,
        cellRendererParams: { deleteAction, getDeleteFields: (d: SubscriberRow) => ({ id: d.id }), getConfirmLabel: () => "Remove this subscriber?" },
      },
    ],
    [deleteAction]
  );

  return (
    <AdminGrid<SubscriberRow>
      rowData={rows}
      columnDefs={columnDefs}
      quickFilterPlaceholder="Search subscribers…"
      resultsLabel="subscribers"
      exportFileName="newsletter"
      bulkActions={[
        { label: "Subscribe", icon: "bi-check2", run: (ids) => bulkStatus(ids, "subscribed") },
        { label: "Unsubscribe", icon: "bi-x", danger: true, run: (ids) => bulkStatus(ids, "unsubscribed") },
      ]}
    />
  );
}
