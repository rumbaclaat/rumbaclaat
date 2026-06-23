"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import SortableList from "@/components/admin/dnd/sortable-list";
import MediaPickerModal from "./media-picker-modal";

type Item = { id: string; url: string };

/**
 * Multi-image field with upload/library add + drag reorder. Serialises the
 * ordered URLs into a hidden <textarea name={name}> (newline-separated) so the
 * existing `galleryImages` server-action parsing is unchanged.
 */
export default function GalleryField({
  name,
  label,
  value = [],
  hint,
}: {
  name: string;
  label: string;
  value?: string[];
  hint?: string;
}) {
  const idRef = useRef(0);
  const [items, setItems] = useState<Item[]>(() =>
    value.filter(Boolean).map((url) => ({ id: `g${idRef.current++}`, url }))
  );
  const [showPicker, setShowPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function add(url: string) {
    setItems((prev) => [...prev, { id: `g${idRef.current++}`, url }]);
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function upload(file: File) {
    setUploading(true);
    setProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/admin/api/media");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const m = JSON.parse(xhr.responseText);
          if (m?.url) add(m.url);
        } catch {}
      }
    };
    xhr.onerror = () => setUploading(false);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("alt", label);
    xhr.send(fd);
  }

  const serialized = items.map((i) => i.url).join("\n");

  return (
    <div className="col-12">
      <label className="form-label">{label}</label>
      {/* hidden value consumed by the server action */}
      <textarea name={name} value={serialized} readOnly hidden />

      <div className="d-flex gap-2 mb-2 flex-wrap">
        <button type="button" className="btn btn-outline-gold btn-sm" onClick={() => fileRef.current?.click()}>
          <i className="bi bi-upload me-1" aria-hidden="true" />Upload
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPicker(true)}>
          <i className="bi bi-images me-1" aria-hidden="true" />Add from library
        </button>
      </div>

      {uploading && (
        <div className="admin-image-progress mb-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}

      {items.length === 0 ? (
        <p className="td-muted" style={{ fontSize: ".82rem" }}>No images yet.</p>
      ) : (
        <SortableList
          items={items}
          onReorder={setItems}
          itemClassName="admin-gallery-item"
          renderItem={(it) => (
            <div className="d-flex align-items-center gap-2 w-100" style={{ minWidth: 0 }}>
              <img src={it.url} alt="" />
              <span className="td-muted text-truncate flex-grow-1" style={{ fontSize: ".72rem" }}>{it.url}</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-danger"
                onClick={() => remove(it.id)}
                aria-label="Remove image"
              >
                <i className="bi bi-trash" aria-hidden="true" />
              </button>
            </div>
          )}
        />
      )}

      {hint && <div className="form-text" style={{ color: "var(--text-dim)" }}>{hint}</div>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
      <MediaPickerModal show={showPicker} onHide={() => setShowPicker(false)} onSelect={(u) => add(u)} />
    </div>
  );
}
