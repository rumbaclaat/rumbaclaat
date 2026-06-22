"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "rc_cookie_choice";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function choose(choice: "accepted" | "rejected") {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="rc-cookie-bar"
      role="region"
      aria-label="Cookie consent"
    >
      <div className="container d-flex flex-wrap align-items-center justify-content-between gap-3">
        <p className="m-0" style={{ fontSize: ".8125rem", maxWidth: 620 }}>
          We use essential cookies to make the site work, and optional cookies to
          improve it. You can reject non-essential cookies. See our{" "}
          <a href="/cookies">Cookie Policy</a>.
        </p>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-gold btn-sm"
            onClick={() => choose("rejected")}
          >
            Reject non-essential
          </button>
          <button
            type="button"
            className="btn btn-gold btn-sm"
            onClick={() => choose("accepted")}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
