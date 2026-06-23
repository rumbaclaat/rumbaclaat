"use client";

import { useState } from "react";
import SortableList from "@/components/admin/dnd/sortable-list";
import ImageField from "@/components/admin/media/image-field";

export type VariantItem = {
  id: string;
  name: string | null;
  colourName: string | null;
  colourHex: string | null;
  size: string | null;
  sku: string;
  priceDelta: number;
  stockQty: number;
  imageUrl: string | null;
  active: boolean;
};

export default function VariantEditor({
  productId,
  variants,
  updateAction,
  deleteAction,
  addAction,
  reorderAction,
}: {
  productId: string;
  variants: VariantItem[];
  updateAction: (fd: FormData) => void | Promise<void>;
  deleteAction: (fd: FormData) => void | Promise<void>;
  addAction: (fd: FormData) => void | Promise<void>;
  reorderAction: (productId: string, ids: string[]) => void | Promise<void>;
}) {
  const [items, setItems] = useState(variants);

  function onReorder(next: VariantItem[]) {
    setItems(next);
    void reorderAction(productId, next.map((v) => v.id));
  }

  return (
    <div>
      {items.length === 0 ? (
        <p className="td-muted">No variants yet. Add one below.</p>
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          itemClassName="admin-card mb-2"
          renderItem={(v) => (
            <div className="w-100" style={{ position: "relative" }}>
              <form action={updateAction} className="row g-2 align-items-end">
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="productId" value={productId} />
                <ImageField name="imageUrl" label="Image" value={v.imageUrl ?? ""} col="col-12 col-md-2" />
                <div className="col-6 col-md-2"><label className="form-label">Name</label><input name="name" className="form-control form-control-sm" defaultValue={v.name ?? ""} placeholder="Red / L" /></div>
                <div className="col-6 col-md-2"><label className="form-label">Colour</label><input name="colourName" className="form-control form-control-sm" defaultValue={v.colourName ?? ""} /></div>
                <div className="col-4 col-md-1"><label className="form-label">Hex</label><input name="colourHex" className="form-control form-control-sm" defaultValue={v.colourHex ?? ""} placeholder="#000" /></div>
                <div className="col-4 col-md-1"><label className="form-label">Size</label><input name="size" className="form-control form-control-sm" defaultValue={v.size ?? ""} /></div>
                <div className="col-4 col-md-1"><label className="form-label">+£</label><input name="priceDelta" type="number" step="0.01" className="form-control form-control-sm" defaultValue={Number(v.priceDelta).toFixed(2)} /></div>
                <div className="col-6 col-md-1"><label className="form-label">Stock</label><input name="stockQty" type="number" className="form-control form-control-sm" defaultValue={v.stockQty} /></div>
                <div className="col-6 col-md-1 d-flex align-items-end">
                  <div className="form-check"><input className="form-check-input" type="checkbox" name="active" id={`act-${v.id}`} defaultChecked={v.active} /><label className="form-check-label" htmlFor={`act-${v.id}`}>Active</label></div>
                </div>
                <div className="col-12 d-flex gap-2 align-items-center">
                  <span className="td-muted" style={{ fontSize: ".72rem" }}>{v.sku}</span>
                  <button type="submit" className="btn btn-outline-gold btn-sm ms-auto">Save</button>
                </div>
              </form>
              <form action={deleteAction}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="productId" value={productId} />
                <button type="submit" className="btn btn-ghost btn-sm text-danger" style={{ position: "absolute", top: 8, right: 8 }} aria-label="Delete variant"><i className="bi bi-trash" /></button>
              </form>
            </div>
          )}
        />
      )}

      <div className="admin-card mt-3">
        <h3 className="admin-form-section-title mb-2" style={{ fontSize: "1rem" }}>Add variant</h3>
        <form action={addAction} className="row g-2 align-items-end">
          <input type="hidden" name="productId" value={productId} />
          <div className="col-6 col-md-2"><label className="form-label">Colour</label><input name="colourName" className="form-control form-control-sm" /></div>
          <div className="col-6 col-md-2"><label className="form-label">Hex</label><input name="colourHex" className="form-control form-control-sm" placeholder="#000000" /></div>
          <div className="col-4 col-md-2"><label className="form-label">Size</label><input name="size" className="form-control form-control-sm" /></div>
          <div className="col-4 col-md-2"><label className="form-label">+£</label><input name="priceDelta" type="number" step="0.01" className="form-control form-control-sm" defaultValue="0" /></div>
          <div className="col-4 col-md-2"><label className="form-label">Stock</label><input name="stockQty" type="number" className="form-control form-control-sm" defaultValue="0" /></div>
          <div className="col-12 col-md-2"><button type="submit" className="btn btn-gold btn-sm w-100">+ Add</button></div>
        </form>
      </div>
    </div>
  );
}
