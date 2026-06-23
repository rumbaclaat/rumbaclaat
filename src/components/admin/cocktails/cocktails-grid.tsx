"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { StatusCell, RowActionsCell } from "@/components/admin/grid/cells";

export type CocktailRow = { id: string; name: string; slug: string; difficulty: string; time: string; status: string };

function NameCell(p: CustomCellRendererProps<CocktailRow>) {
  const d = p.data!;
  return <Link href={`/admin/cocktails/${d.id}`} className="gold">{d.name}</Link>;
}

export default function CocktailsGrid({ rows, deleteAction }: { rows: CocktailRow[]; deleteAction: (fd: FormData) => void | Promise<void> }) {
  const columnDefs = useMemo<ColDef<CocktailRow>[]>(
    () => [
      { headerName: "Name", field: "name", flex: 2, minWidth: 220, cellRenderer: NameCell },
      { headerName: "Difficulty", field: "difficulty", minWidth: 140 },
      { headerName: "Time", field: "time", minWidth: 110 },
      { headerName: "Status", field: "status", minWidth: 140, cellRenderer: StatusCell },
      {
        headerName: "", field: "id", sortable: false, filter: false, resizable: false, minWidth: 130, maxWidth: 150,
        cellRenderer: RowActionsCell,
        cellRendererParams: {
          getEditHref: (d: CocktailRow) => `/admin/cocktails/${d.id}`,
          getViewHref: (d: CocktailRow) => `/cocktails/${d.slug}`,
          deleteAction,
          getDeleteFields: (d: CocktailRow) => ({ id: d.id }),
          getConfirmLabel: (d: CocktailRow) => `Delete “${d.name}”?`,
        },
      },
    ],
    [deleteAction]
  );
  return <AdminGrid<CocktailRow> rowData={rows} columnDefs={columnDefs} quickFilterPlaceholder="Search cocktails…" resultsLabel="cocktails" exportFileName="cocktails" />;
}
