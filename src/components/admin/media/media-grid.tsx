"use client";

import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { ThumbCell, DateCell, RowActionsCell } from "@/components/admin/grid/cells";

export type MediaRow = { id: string; url: string; alt: string; type: string; created: string };

function CopyCell(p: CustomCellRendererProps<MediaRow>) {
  const url = p.data!.url;
  return (
    <span className="d-inline-flex align-items-center gap-2 w-100" style={{ height: "100%" }}>
      <span className="td-muted text-truncate" style={{ fontSize: ".72rem", maxWidth: 240 }}>{url}</span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        title="Copy URL"
        onClick={() => navigator.clipboard?.writeText(url)}
      >
        <i className="bi bi-clipboard" aria-hidden="true" />
      </button>
    </span>
  );
}

export default function MediaGrid({ rows, deleteAction }: { rows: MediaRow[]; deleteAction: (fd: FormData) => void | Promise<void> }) {
  const columnDefs = useMemo<ColDef<MediaRow>[]>(
    () => [
      { headerName: "", field: "url", sortable: false, filter: false, minWidth: 64, maxWidth: 70, cellRenderer: ThumbCell },
      { headerName: "Alt text", field: "alt", flex: 1.4, minWidth: 180 },
      { headerName: "URL", field: "url", flex: 2, minWidth: 260, cellRenderer: CopyCell },
      { headerName: "Type", field: "type", minWidth: 120 },
      { headerName: "Uploaded", field: "created", minWidth: 150, cellRenderer: DateCell, sort: "desc" },
      {
        headerName: "", field: "id", sortable: false, filter: false, resizable: false, minWidth: 90, maxWidth: 110,
        cellRenderer: RowActionsCell,
        cellRendererParams: {
          getViewHref: (d: MediaRow) => d.url,
          deleteAction,
          getDeleteFields: (d: MediaRow) => ({ id: d.id }),
          getConfirmLabel: () => "Delete this image?",
        },
      },
    ],
    [deleteAction]
  );
  return <AdminGrid<MediaRow> rowData={rows} columnDefs={columnDefs} quickFilterPlaceholder="Search media…" resultsLabel="files" exportFileName="media" rowHeight={60} />;
}
