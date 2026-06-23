"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { StatusCell, RowActionsCell } from "@/components/admin/grid/cells";

export type BlogRow = { id: string; title: string; slug: string; category: string; status: string; featured: string };

function TitleCell(p: CustomCellRendererProps<BlogRow>) {
  const d = p.data!;
  return <Link href={`/admin/blog/${d.id}`} className="gold">{d.title}</Link>;
}

export default function BlogGrid({ rows, deleteAction }: { rows: BlogRow[]; deleteAction: (fd: FormData) => void | Promise<void> }) {
  const columnDefs = useMemo<ColDef<BlogRow>[]>(
    () => [
      { headerName: "Title", field: "title", flex: 2.2, minWidth: 240, cellRenderer: TitleCell },
      { headerName: "Category", field: "category", minWidth: 150 },
      { headerName: "Status", field: "status", minWidth: 140, cellRenderer: StatusCell },
      { headerName: "Featured", field: "featured", minWidth: 110 },
      {
        headerName: "", field: "id", sortable: false, filter: false, resizable: false, minWidth: 130, maxWidth: 150,
        cellRenderer: RowActionsCell,
        cellRendererParams: {
          getEditHref: (d: BlogRow) => `/admin/blog/${d.id}`,
          getViewHref: (d: BlogRow) => `/blog/${d.slug}`,
          deleteAction,
          getDeleteFields: (d: BlogRow) => ({ id: d.id }),
          getConfirmLabel: (d: BlogRow) => `Delete “${d.title}”?`,
        },
      },
    ],
    [deleteAction]
  );
  return <AdminGrid<BlogRow> rowData={rows} columnDefs={columnDefs} quickFilterPlaceholder="Search posts…" resultsLabel="posts" exportFileName="blog" />;
}
