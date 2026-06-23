"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Dropdown from "react-bootstrap/Dropdown";

export default function RowActions({
  editHref,
  viewHref,
  deleteAction,
  deleteFields,
  confirmLabel = "Delete this item? This cannot be undone.",
  extra,
}: {
  editHref?: string;
  viewHref?: string;
  /** A bound server action — called with FormData built from `deleteFields`. */
  deleteAction?: (formData: FormData) => void | Promise<void>;
  deleteFields?: Record<string, string>;
  confirmLabel?: string;
  extra?: ReactNode;
}) {
  function handleDelete() {
    if (!deleteAction) return;
    if (typeof window !== "undefined" && !window.confirm(confirmLabel)) return;
    const fd = new FormData();
    Object.entries(deleteFields ?? {}).forEach(([k, v]) => fd.set(k, v));
    void deleteAction(fd);
  }

  return (
    <Dropdown align="end" className="admin-row-actions">
      <Dropdown.Toggle
        as="button"
        type="button"
        className="btn btn-ghost btn-sm admin-kebab"
        aria-label="Row actions"
      >
        <i className="bi bi-three-dots-vertical" aria-hidden="true" />
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {editHref && (
          <Dropdown.Item as={Link} href={editHref}>
            <i className="bi bi-pencil me-2" aria-hidden="true" />Edit
          </Dropdown.Item>
        )}
        {viewHref && (
          <Dropdown.Item href={viewHref} target="_blank" rel="noopener">
            <i className="bi bi-box-arrow-up-right me-2" aria-hidden="true" />View
          </Dropdown.Item>
        )}
        {extra}
        {deleteAction && (
          <>
            <Dropdown.Divider />
            <Dropdown.Item
              as="button"
              type="button"
              className="text-danger"
              onClick={handleDelete}
            >
              <i className="bi bi-trash me-2" aria-hidden="true" />Delete
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
