"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";

export type MediaItem = { id: string; url: string; alt: string | null; bucketPath: string };

export default function MediaPickerModal({
  show,
  onHide,
  onSelect,
}: {
  show: boolean;
  onHide: () => void;
  onSelect: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) return;
    let active = true;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/admin/api/media?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => {
          if (active) setItems(Array.isArray(d) ? d : []);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 150);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [show, q]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title style={{ fontFamily: "var(--serif)" }}>Choose from media library</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="input-group input-group-sm mb-3" style={{ maxWidth: 340 }}>
          <span className="input-group-text" aria-hidden="true"><i className="bi bi-search" /></span>
          <input
            className="form-control"
            placeholder="Search media…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search media"
          />
        </div>

        {loading && <p className="td-muted">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="td-muted">No media found. Upload an image from the Media library or via the Upload button.</p>
        )}

        <div className="admin-media-grid">
          {items.map((m) => (
            <button
              type="button"
              key={m.id}
              className="admin-media-tile"
              style={{ cursor: "pointer", textAlign: "left", padding: 0 }}
              onClick={() => {
                onSelect(m.url);
                onHide();
              }}
              title={m.alt ?? m.bucketPath}
            >
              <img src={m.url} alt={m.alt ?? ""} className="admin-media-thumb" />
              <span className="admin-media-meta">
                <span className="td-muted text-truncate" style={{ fontSize: ".7rem" }}>
                  {m.alt || m.bucketPath.split("/").pop()}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}
