"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import MediaPickerModal from "./media-picker-modal";

/**
 * Universal image control for any form field. Renders a preview + Upload
 * (with progress) + Choose-from-library, and writes the resulting URL into a
 * hidden <input name={name}> so existing FormData server actions are unchanged.
 */
export default function ImageField({
  name,
  label,
  value = "",
  hint,
  required,
  col = "col-12",
}: {
  name: string;
  label: string;
  value?: string;
  hint?: string;
  required?: boolean;
  col?: string;
}) {
  const [url, setUrl] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile() {
    fileRef.current?.click();
  }

  function upload(file: File) {
    setUploading(true);
    setProgress(0);
    setError(null);
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
          if (m?.url) setUrl(m.url);
          else setError("Upload failed");
        } catch {
          setError("Upload failed");
        }
      } else {
        setError("Upload failed");
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      setError("Upload failed");
    };
    const fd = new FormData();
    fd.append("file", file);
    fd.append("alt", label);
    xhr.send(fd);
  }

  return (
    <div className={col}>
      <label className="form-label">
        {label} {required && <span style={{ color: "var(--gold-hi)" }}>*</span>}
      </label>
      <input type="hidden" name={name} value={url} />

      <div className="admin-image-field">
        {url ? (
          <div className="admin-image-preview">
            <img src={url} alt="" />
            <div className="admin-image-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={pickFile}>
                <i className="bi bi-arrow-repeat me-1" aria-hidden="true" />Replace
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPicker(true)}>
                <i className="bi bi-images me-1" aria-hidden="true" />Library
              </button>
              <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => setUrl("")}>
                <i className="bi bi-x-lg me-1" aria-hidden="true" />Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-image-empty">
            <i className="bi bi-image" aria-hidden="true" />
            <div className="d-flex gap-2 flex-wrap justify-content-center">
              <button type="button" className="btn btn-outline-gold btn-sm" onClick={pickFile}>
                <i className="bi bi-upload me-1" aria-hidden="true" />Upload
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPicker(true)}>
                <i className="bi bi-images me-1" aria-hidden="true" />Choose from library
              </button>
            </div>
          </div>
        )}

        {uploading && (
          <div className="admin-image-progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <div className="text-danger" style={{ fontSize: ".8rem" }}>{error}</div>}
      </div>

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

      <MediaPickerModal show={showPicker} onHide={() => setShowPicker(false)} onSelect={(u) => setUrl(u)} />
    </div>
  );
}
