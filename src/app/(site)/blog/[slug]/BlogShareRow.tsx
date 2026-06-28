"use client";

import { useEffect, useState } from "react";

export default function BlogShareRow({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy link");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const enc = encodeURIComponent;
  const twitter = url
    ? `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`
    : "#";
  const facebook = url
    ? `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`
    : "#";
  const linkedin = url
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`
    : "#";

  function copyLink() {
    if (navigator.clipboard) navigator.clipboard.writeText(window.location.href);
    setCopyLabel("✓ Copied");
    setTimeout(() => setCopyLabel("Copy link"), 1500);
  }

  return (
    <div
      className="d-flex gap-2 align-items-center mt-5 pt-4 flex-wrap"
      style={{ borderTop: "1px solid var(--gold-bdr)" }}
    >
      <span
        style={{
          fontSize: ".75rem",
          color: "var(--text-muted)",
          letterSpacing: ".1em",
        }}
      >
        SHARE
      </span>
      <a className="btn btn-ghost btn-sm" href={twitter} target="_blank" rel="noopener">
        X / Twitter
      </a>
      <a className="btn btn-ghost btn-sm" href={facebook} target="_blank" rel="noopener">
        Facebook
      </a>
      <a className="btn btn-ghost btn-sm" href={linkedin} target="_blank" rel="noopener">
        LinkedIn
      </a>
      <button type="button" className="btn btn-ghost btn-sm" onClick={copyLink}>
        {copyLabel}
      </button>
    </div>
  );
}
