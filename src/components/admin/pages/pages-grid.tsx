"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { StatusCell, DateCell, RowActionsCell } from "@/components/admin/grid/cells";

export type PageRow = {
  id: string;
  title: string;
  slug: string;
  blocks: number;
  updatedAt: string;
  status: string;
};

function PageNameCell(p: CustomCellRendererProps<PageRow>) {
  const d = p.data!;
  return (
    <span className="d-inline-flex flex-column justify-content-center" style={{ height: "100%", lineHeight: 1.25 }}>
      <Link href={`/admin/pages/${d.id}`} className="gold">{d.title}</Link>
      <span className="td-muted" style={{ fontSize: ".72rem" }}>/{d.slug}</span>
    </span>
  );
}

export default function PagesGrid({
  rows,
  deleteAction,
}: {
  rows: PageRow[];
  deleteAction: (fd: FormData) => void | Promise<void>;
}) {
  const columnDefs = useMemo<ColDef<PageRow>[]>(
    () => [
      { headerName: "Page", field: "title", flex: 2.4, minWidth: 240, cellRenderer: PageNameCell },
      { headerName: "Blocks", field: "blocks", minWidth: 110 },
      { headerName: "Updated", field: "updatedAt", minWidth: 150, cellRenderer: DateCell },
      { headerName: "Status", field: "status", minWidth: 140, cellRenderer: StatusCell },
      {
        headerName: "",
        field: "id",
        sortable: false,
        filter: false,
        resizable: false,
        minWidth: 130,
        maxWidth: 150,
        cellRenderer: RowActionsCell,
        cellRendererParams: {
          getEditHref: (d: PageRow) => `/admin/pages/${d.id}`,
          getViewHref: (d: PageRow) => `/${d.slug}`,
          deleteAction,
          getDeleteFields: (d: PageRow) => ({ id: d.id }),
          getConfirmLabel: (d: PageRow) => `Delete “${d.title}”? This cannot be undone.`,
        },
      },
    ],
    [deleteAction]
  );

  return (
    <AdminGrid<PageRow>
      rowData={rows}
      columnDefs={columnDefs}
      quickFilterPlaceholder="Search pages…"
      resultsLabel="pages"
    />
  );
}
