"use client";

import { useState } from "react";
import SortableList from "@/components/admin/dnd/sortable-list";

export type NavItemRow = { id: string; label: string; url: string; visible: boolean };

export default function NavItemsEditor({
  menuId,
  items,
  updateAction,
  deleteAction,
  reorderAction,
}: {
  menuId: string;
  items: NavItemRow[];
  updateAction: (fd: FormData) => void | Promise<void>;
  deleteAction: (fd: FormData) => void | Promise<void>;
  reorderAction: (menuId: string, ids: string[]) => void | Promise<void>;
}) {
  const [list, setList] = useState(items);
  function onReorder(next: NavItemRow[]) {
    setList(next);
    void reorderAction(menuId, next.map((i) => i.id));
  }
  if (list.length === 0) return <p className="td-muted">No items yet. Add one below.</p>;
  return (
    <SortableList
      items={list}
      onReorder={onReorder}
      itemClassName="admin-card mb-2"
      renderItem={(it) => (
        <div className="w-100" style={{ position: "relative" }}>
          <form action={updateAction} className="row g-2 align-items-end">
            <input type="hidden" name="id" value={it.id} />
            <input type="hidden" name="menuId" value={menuId} />
            <div className="col-md-4"><label className="form-label">Label</label><input name="label" className="form-control form-control-sm" defaultValue={it.label} /></div>
            <div className="col-md-5"><label className="form-label">URL</label><input name="url" className="form-control form-control-sm" defaultValue={it.url} /></div>
            <div className="col-md-2 d-flex align-items-end"><div className="form-check"><input className="form-check-input" type="checkbox" name="visible" id={`v-${it.id}`} defaultChecked={it.visible} /><label className="form-check-label" htmlFor={`v-${it.id}`}>Visible</label></div></div>
            <div className="col-md-1 d-flex align-items-end"><button type="submit" className="btn btn-outline-gold btn-sm w-100">Save</button></div>
          </form>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={it.id} />
            <input type="hidden" name="menuId" value={menuId} />
            <button type="submit" className="btn btn-ghost btn-sm text-danger" style={{ position: "absolute", top: 6, right: 6 }} aria-label="Delete"><i className="bi bi-trash" /></button>
          </form>
        </div>
      )}
    />
  );
}
