"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { RowActionsCell } from "@/components/admin/grid/cells";

export type CategoryRow = { id: string; name: string; slug: string; products: number; order: number };

function NameCell(p: CustomCellRendererProps<CategoryRow>) {
  const d = p.data!;
  return <Link href={`/admin/categories/${d.id}`} className="gold">{d.name}</Link>;
}

export default function CategoriesGrid({ rows, deleteAction }: { rows: CategoryRow[]; deleteAction: (fd: FormData) => void | Promise<void> }) {
  const columnDefs = useMemo<ColDef<CategoryRow>[]>(
    () => [
      { headerName: "Name", field: "name", flex: 2, minWidth: 220, cellRenderer: NameCell },
      { headerName: "Slug", field: "slug", minWidth: 180 },
      { headerName: "Products", field: "products", minWidth: 120 },
      { headerName: "Order", field: "order", minWidth: 100 },
      {
        headerName: "", field: "id", sortable: false, filter: false, resizable: false, minWidth: 130, maxWidth: 150,
        cellRenderer: RowActionsCell,
        cellRendererParams: {
          getEditHref: (d: CategoryRow) => `/admin/categories/${d.id}`,
          deleteAction,
          getDeleteFields: (d: CategoryRow) => ({ id: d.id }),
          getConfirmLabel: (d: CategoryRow) => `Delete “${d.name}”?`,
        },
      },
    ],
    [deleteAction]
  );
  return <AdminGrid<CategoryRow> rowData={rows} columnDefs={columnDefs} quickFilterPlaceholder="Search categories…" resultsLabel="categories" exportFileName="categories" />;
}
