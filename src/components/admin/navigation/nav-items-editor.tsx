"use client";

import { useRef, useState } from "react";
import SortableList from "@/components/admin/dnd/sortable-list";
import FormSection from "@/components/admin/ui/form-section";
import SaveBar from "@/components/admin/ui/save-bar";

export type NavItemRow = { id: string; label: string; url: string; visible: boolean };

export default function NavItemsEditor({
  menuId,
  menuLocation,
  items,
  addAction,
  updateAction,
  deleteAction,
  reorderAction,
}: {
  menuId: string;
  menuLocation: string;
  items: NavItemRow[];
  addAction: (fd: FormData) => void | Promise<void>;
  updateAction: (fd: FormData) => void | Promise<void>;
  deleteAction: (fd: FormData) => void | Promise<void>;
  reorderAction: (menuId: string, ids: string[]) => void | Promise<void>;
}) {
  const [list, setList] = useState(items);
  // Each row's <form> registers here so the single gold Save can submit them all.
  const formsRef = useRef<Map<string, HTMLFormElement>>(new Map());

  function onReorder(next: NavItemRow[]) {
    setList(next);
    void reorderAction(menuId, next.map((i) => i.id));
  }

  function saveAll() {
    formsRef.current.forEach((f) => f.requestSubmit());
  }

  const visibleCount = list.filter((i) => i.visible).length;

  return (
    <>
    <div className="admin-product-grid">
      {/* Main — titled FormSection cards */}
      <div className="admin-product-main">
        <FormSection title="Menu items" grid={false}>
          {list.length === 0 ? (
            <p className="td-muted mb-0">No items yet. Add one below.</p>
          ) : (
            <SortableList
              items={list}
              onReorder={onReorder}
              itemClassName="admin-card mb-2"
              renderItem={(it) => (
                <div className="w-100" style={{ position: "relative" }}>
                  <form
                    action={updateAction}
                    ref={(el) => {
                      if (el) formsRef.current.set(it.id, el);
                      else formsRef.current.delete(it.id);
                    }}
                    className="row g-2 align-items-end"
                  >
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="menuId" value={menuId} />
                    <div className="col-md-4"><label className="form-label">Label</label><input name="label" className="form-control form-control-sm" defaultValue={it.label} /></div>
                    <div className="col-md-5"><label className="form-label">URL</label><input name="url" className="form-control form-control-sm" defaultValue={it.url} /></div>
                    <div className="col-md-2 d-flex align-items-end"><div className="form-check"><input className="form-check-input" type="checkbox" name="visible" id={`v-${it.id}`} defaultChecked={it.visible} /><label className="form-check-label" htmlFor={`v-${it.id}`}>Visible</label></div></div>
                    <div className="col-md-1 d-flex align-items-end"><button type="submit" className="btn btn-ghost btn-sm w-100">Save</button></div>
                  </form>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="menuId" value={menuId} />
                    <button type="submit" className="btn btn-ghost btn-sm text-danger" style={{ position: "absolute", top: 6, right: 6 }} aria-label="Delete"><i className="bi bi-trash" /></button>
                  </form>
                </div>
              )}
            />
          )}
        </FormSection>

        <FormSection title="Add item" grid={false}>
          <form action={addAction} className="row g-2 align-items-end">
            <input type="hidden" name="menuId" value={menuId} />
            <div className="col-md-5"><label className="form-label" htmlFor="nl">Label</label><input id="nl" name="label" className="form-control form-control-sm" required /></div>
            <div className="col-md-5"><label className="form-label" htmlFor="nu">URL</label><input id="nu" name="url" className="form-control form-control-sm" placeholder="/shop" required /></div>
            <div className="col-md-2"><button className="btn btn-outline-gold btn-sm w-100">Add item</button></div>
          </form>
        </FormSection>
      </div>

      {/* Rail — Publish / Status card holding the single gold Save (via SaveBar) */}
      <div className="admin-product-rail">
        <FormSection title="Publish" grid={false}>
          <div className="order-summary-item"><span className="td-muted">Menu location</span><span style={{ textTransform: "capitalize" }}>{menuLocation}</span></div>
          <div className="order-summary-item"><span className="td-muted">Items</span><span>{list.length}</span></div>
          <div className="order-summary-item"><span className="td-muted">Visible</span><span>{visibleCount}</span></div>
          <p className="td-muted mt-2 mb-0" style={{ fontSize: ".8rem" }}>Save changes applies every edited row.</p>
        </FormSection>
      </div>
    </div>

    {/* Sticky save bar — the single gold action; submits every edited row form. */}
    <form onSubmit={(e) => { e.preventDefault(); saveAll(); }}>
      <SaveBar submitLabel="Save changes" cancelHref="/admin/navigation" />
    </form>
    </>
  );
}
