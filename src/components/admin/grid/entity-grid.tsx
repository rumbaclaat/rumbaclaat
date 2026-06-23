"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "./admin-grid";
import { RowActionsCell, StatusCell, MoneyCell, DateCell } from "./cells";

export type GridRow = { id: string; slug?: string } & Record<string, unknown>;
export type GridColumn = { field: string; header: string; width?: number; flex?: number; type?: "text" | "status" | "money" | "date" };

/** Generic AG-Grid list for simple CRUD entities. First-column link to edit,
 *  status/money/date cells, row-actions (edit/view/delete), optional drag reorder. */
export default function EntityGrid({
  rows,
  columns,
  nameField,
  editBase,
  viewBase,
  deleteAction,
  reorderAction,
  resultsLabel = "rows",
  quickFilter = "Search…",
  exportName = "export",
}: {
  rows: GridRow[];
  columns: GridColumn[];
  nameField?: string;
  editBase?: string;
  viewBase?: string;
  deleteAction?: (fd: FormData) => void | Promise<void>;
  reorderAction?: (ids: string[]) => void | Promise<void>;
  resultsLabel?: string;
  quickFilter?: string;
  exportName?: string;
}) {
  const columnDefs = useMemo<ColDef<GridRow>[]>(() => {
    const cols: ColDef<GridRow>[] = columns.map((c) => {
      const def: ColDef<GridRow> = { headerName: c.header, field: c.field, minWidth: c.width ?? 120, flex: c.flex ?? 1 };
      if (c.field === nameField && editBase) {
        def.cellRenderer = (p: CustomCellRendererProps<GridRow>) => <Link href={`${editBase}/${p.data!.id}`} className="gold">{String(p.value ?? "")}</Link>;
        def.flex = c.flex ?? 1.8;
      } else if (c.type === "status") def.cellRenderer = StatusCell;
      else if (c.type === "money") def.cellRenderer = MoneyCell;
      else if (c.type === "date") def.cellRenderer = DateCell;
      return def;
    });
    if (deleteAction || editBase || viewBase) {
      cols.push({
        headerName: "", field: "id", sortable: false, filter: false, resizable: false, minWidth: 120, maxWidth: 150,
        cellRenderer: RowActionsCell,
        cellRendererParams: {
          getEditHref: editBase ? (d: GridRow) => `${editBase}/${d.id}` : undefined,
          getViewHref: viewBase ? (d: GridRow) => `${viewBase}/${d.slug ?? d.id}` : undefined,
          deleteAction,
          getDeleteFields: (d: GridRow) => ({ id: d.id }),
          getConfirmLabel: () => "Delete this item? This cannot be undone.",
        },
      });
    }
    return cols;
  }, [columns, nameField, editBase, viewBase, deleteAction]);

  return (
    <AdminGrid<GridRow>
      rowData={rows}
      columnDefs={columnDefs}
      quickFilterPlaceholder={quickFilter}
      resultsLabel={resultsLabel}
      exportFileName={exportName}
      onReorder={reorderAction}
    />
  );
}
