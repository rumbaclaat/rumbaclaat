"use client";

import Link from "next/link";
import type { CustomCellRendererProps } from "ag-grid-react";
import StatusBadge from "@/components/admin/ui/status-badge";

/* eslint-disable @next/next/no-img-element */

export function ThumbCell(
  params: CustomCellRendererProps & { fallbackIcon?: string }
) {
  const url = params.value as string | null | undefined;
  return (
    <span className="d-inline-flex align-items-center" style={{ height: "100%" }}>
      {url ? (
        <img src={url} alt="" className="admin-thumb" />
      ) : (
        <span className="admin-thumb admin-thumb-ph" aria-hidden="true">
          <i className={`bi ${params.fallbackIcon ?? "bi-image"}`} />
        </span>
      )}
    </span>
  );
}

export function LinkCell(
  params: CustomCellRendererProps & {
    getHref?: (d: unknown) => string;
    secondary?: (d: unknown) => string | null | undefined;
  }
) {
  const href = params.getHref?.(params.data);
  const secondary = params.secondary?.(params.data);
  return (
    <span className="d-inline-flex flex-column justify-content-center" style={{ height: "100%", lineHeight: 1.25 }}>
      {href ? (
        <Link href={href} className="gold">{params.value}</Link>
      ) : (
        <span>{params.value}</span>
      )}
      {secondary && <span className="td-muted" style={{ fontSize: ".72rem" }}>{secondary}</span>}
    </span>
  );
}

export function StatusCell(params: CustomCellRendererProps) {
  return (
    <span className="d-inline-flex align-items-center" style={{ height: "100%" }}>
      <StatusBadge status={params.value as string} />
    </span>
  );
}

export function MoneyCell(params: CustomCellRendererProps & { currency?: string }) {
  const v = params.value;
  if (v == null || v === "") return <span className="td-muted">—</span>;
  const n = Number(v);
  const symbol = params.currency ?? "£";
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{symbol}{n.toFixed(2)}</span>;
}

export function DateCell(params: CustomCellRendererProps) {
  const v = params.value;
  if (!v) return <span className="td-muted">—</span>;
  const d = new Date(v as string);
  return (
    <span className="td-muted">
      {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
    </span>
  );
}

type RowActionsParams = CustomCellRendererProps & {
  getEditHref?: (d: unknown) => string;
  getViewHref?: (d: unknown) => string;
  deleteAction?: (fd: FormData) => void | Promise<void>;
  getDeleteFields?: (d: unknown) => Record<string, string>;
  getConfirmLabel?: (d: unknown) => string;
};

export function RowActionsCell(params: RowActionsParams) {
  const data = params.data;
  const editHref = params.getEditHref?.(data);
  const viewHref = params.getViewHref?.(data);

  function handleDelete() {
    if (!params.deleteAction) return;
    const label = params.getConfirmLabel?.(data) ?? "Delete this item? This cannot be undone.";
    if (typeof window !== "undefined" && !window.confirm(label)) return;
    const fd = new FormData();
    Object.entries(params.getDeleteFields?.(data) ?? {}).forEach(([k, v]) => fd.set(k, v));
    void params.deleteAction(fd);
  }

  return (
    <span className="d-inline-flex align-items-center gap-1" style={{ height: "100%" }}>
      {editHref && (
        <Link href={editHref} className="btn btn-ghost btn-sm" title="Edit" aria-label="Edit">
          <i className="bi bi-pencil" aria-hidden="true" />
        </Link>
      )}
      {viewHref && (
        <a href={viewHref} target="_blank" rel="noopener" className="btn btn-ghost btn-sm" title="View" aria-label="View">
          <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
        </a>
      )}
      {params.deleteAction && (
        <button type="button" className="btn btn-ghost btn-sm text-danger" title="Delete" aria-label="Delete" onClick={handleDelete}>
          <i className="bi bi-trash" aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
