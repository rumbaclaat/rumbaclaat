"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type GetRowIdParams,
  type SelectionChangedEvent,
} from "ag-grid-community";
import { adminGridTheme } from "./ag-theme";

ModuleRegistry.registerModules([AllCommunityModule]);

export type BulkAction = {
  label: string;
  icon?: string;
  variant?: string; // bootstrap btn variant suffix, e.g. "outline-gold" | "ghost"
  danger?: boolean;
  confirm?: string;
  run: (ids: string[]) => void | Promise<void>;
};

export default function AdminGrid<T extends { id: string }>({
  rowData,
  columnDefs,
  quickFilterPlaceholder = "Search…",
  resultsLabel = "rows",
  pageSize = 25,
  height,
  autoHeight = false,
  rowHeight = 54,
  bulkActions,
  enableExport = true,
  exportFileName = "export",
}: {
  rowData: T[];
  columnDefs: ColDef<T>[];
  quickFilterPlaceholder?: string;
  resultsLabel?: string;
  pageSize?: number;
  height?: number | string;
  autoHeight?: boolean;
  rowHeight?: number;
  bulkActions?: BulkAction[];
  enableExport?: boolean;
  exportFileName?: string;
}) {
  const router = useRouter();
  const gridRef = useRef<AgGridReact<T>>(null);
  const [quick, setQuick] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const defaultColDef = useMemo<ColDef<T>>(
    () => ({ sortable: true, filter: true, resizable: true, minWidth: 110, flex: 1 }),
    []
  );
  const getRowId = useMemo(() => (p: GetRowIdParams<T>) => p.data.id, []);
  const selectable = Boolean(bulkActions?.length);

  function onSelectionChanged(e: SelectionChangedEvent<T>) {
    setSelected(e.api.getSelectedRows().map((r) => r.id));
  }

  async function runBulk(a: BulkAction) {
    if (a.confirm && typeof window !== "undefined" && !window.confirm(a.confirm.replace("{n}", String(selected.length)))) return;
    setBusy(true);
    try {
      await a.run(selected);
      gridRef.current?.api.deselectAll();
      setSelected([]);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-card p-0" style={{ overflow: "hidden" }}>
      <div className="admin-toolbar">
        <div className="admin-toolbar-search input-group input-group-sm">
          <span className="input-group-text" aria-hidden="true"><i className="bi bi-search" /></span>
          <input
            className="form-control"
            type="search"
            value={quick}
            placeholder={quickFilterPlaceholder}
            aria-label={quickFilterPlaceholder}
            onChange={(e) => setQuick(e.target.value)}
          />
        </div>

        {enableExport && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => gridRef.current?.api.exportDataAsCsv({ fileName: `${exportFileName}.csv` })}
            title="Export visible rows to CSV"
          >
            <i className="bi bi-download me-1" aria-hidden="true" />CSV
          </button>
        )}

        <span className="admin-toolbar-count">{rowData.length} {resultsLabel}</span>
      </div>

      {selectable && selected.length > 0 && (
        <div className="admin-bulkbar">
          <span className="admin-bulkbar-count">{selected.length} selected</span>
          {bulkActions!.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={busy}
              className={`btn btn-sm btn-${a.variant ?? "ghost"}${a.danger ? " text-danger" : ""}`}
              onClick={() => runBulk(a)}
            >
              {a.icon && <i className={`bi ${a.icon} me-1`} aria-hidden="true" />}{a.label}
            </button>
          ))}
          <button type="button" className="btn btn-ghost btn-sm ms-auto" onClick={() => { gridRef.current?.api.deselectAll(); setSelected([]); }}>
            Clear
          </button>
        </div>
      )}

      <div style={autoHeight ? undefined : { height: height ?? "calc(100dvh - 252px)", minHeight: 420 }}>
        <AgGridReact<T>
          ref={gridRef}
          theme={adminGridTheme}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quick}
          getRowId={getRowId}
          rowHeight={rowHeight}
          headerHeight={46}
          rowSelection={selectable ? { mode: "multiRow", enableClickSelection: false } : undefined}
          onSelectionChanged={selectable ? onSelectionChanged : undefined}
          pagination
          paginationPageSize={pageSize}
          paginationPageSizeSelector={[25, 50, 100]}
          domLayout={autoHeight ? "autoHeight" : "normal"}
          animateRows
          suppressCellFocus
          enableCellTextSelection
        />
      </div>
    </div>
  );
}
