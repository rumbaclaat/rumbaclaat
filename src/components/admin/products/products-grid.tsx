"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useMemo } from "react";
import type { ColDef } from "ag-grid-community";
import type { CustomCellRendererProps } from "ag-grid-react";
import AdminGrid from "@/components/admin/grid/admin-grid";
import { StatusCell, RowActionsCell } from "@/components/admin/grid/cells";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
  category: string;
  price: number;
  salePrice: number | null;
  stock: number;
  variants: number;
  status: string;
  slug: string;
};

function ProductCell(p: CustomCellRendererProps<ProductRow>) {
  const d = p.data!;
  return (
    <span className="d-inline-flex align-items-center gap-2" style={{ height: "100%" }}>
      {d.imageUrl ? (
        <img src={d.imageUrl} alt="" className="admin-thumb" />
      ) : (
        <span className="admin-thumb admin-thumb-ph" aria-hidden="true"><i className="bi bi-box-seam" /></span>
      )}
      <span className="d-inline-flex flex-column" style={{ lineHeight: 1.25 }}>
        <Link href={`/admin/products/${d.id}`} className="gold">{d.name}</Link>
        <span className="td-muted" style={{ fontSize: ".72rem" }}>{d.sku}</span>
      </span>
    </span>
  );
}

function PriceCell(p: CustomCellRendererProps<ProductRow>) {
  const d = p.data!;
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      £{d.price.toFixed(2)}
      {d.salePrice != null && <span style={{ color: "var(--gold-hi)" }}> → £{d.salePrice.toFixed(2)}</span>}
    </span>
  );
}

export default function ProductsGrid({
  rows,
  deleteAction,
  bulkStatus,
  bulkDelete,
}: {
  rows: ProductRow[];
  deleteAction: (fd: FormData) => void | Promise<void>;
  bulkStatus?: (ids: string[], status: string) => Promise<void>;
  bulkDelete?: (ids: string[]) => Promise<void>;
}) {
  const columnDefs = useMemo<ColDef<ProductRow>[]>(
    () => [
      { headerName: "Product", field: "name", flex: 2.4, minWidth: 250, cellRenderer: ProductCell },
      { headerName: "Category", field: "category", minWidth: 150 },
      { headerName: "Price", field: "price", minWidth: 140, cellRenderer: PriceCell },
      { headerName: "Stock", field: "stock", minWidth: 100 },
      { headerName: "Variants", field: "variants", minWidth: 110 },
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
          getEditHref: (d: ProductRow) => `/admin/products/${d.id}`,
          getViewHref: (d: ProductRow) => `/product/${d.slug}`,
          deleteAction,
          getDeleteFields: (d: ProductRow) => ({ id: d.id }),
          getConfirmLabel: (d: ProductRow) => `Delete “${d.name}”? This cannot be undone.`,
        },
      },
    ],
    [deleteAction]
  );

  const bulkActions = [];
  if (bulkStatus) {
    bulkActions.push(
      { label: "Publish", icon: "bi-eye", run: (ids: string[]) => bulkStatus(ids, "published") },
      { label: "Archive", icon: "bi-archive", run: (ids: string[]) => bulkStatus(ids, "archived") }
    );
  }
  if (bulkDelete) {
    bulkActions.push({ label: "Delete", icon: "bi-trash", danger: true, confirm: "Delete {n} products?", run: (ids: string[]) => bulkDelete(ids) });
  }

  return (
    <AdminGrid<ProductRow>
      rowData={rows}
      columnDefs={columnDefs}
      quickFilterPlaceholder="Search products…"
      resultsLabel="products"
      exportFileName="products"
      bulkActions={bulkActions.length ? bulkActions : undefined}
    />
  );
}
