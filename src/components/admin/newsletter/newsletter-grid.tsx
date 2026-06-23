"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { StatusCell, DateCell, RowActionsCell } from "@/components/admin/grid/cells";

export type SubscriberRow = { id: string; email: string; name: string; status: string; created: string };

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
      { headerName: "Email", field: "email", flex: 2, minWidth: 220 },
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
