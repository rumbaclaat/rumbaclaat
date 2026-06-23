"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "rc_age_ok";
const MIN_AGE = 18;

// Age verification is skipped during the build phase to keep the dev/preview
// flow fast. MUST be set back to true before launch (UK alcohol compliance).
const AGE_GATE_ENABLED = false;

function isAtLeast(age: number, dob: Date): boolean {
  const now = new Date();
  const threshold = new Date(
    now.getFullYear() - age,
    now.getMonth(),
    now.getDate()
  );
  return dob <= threshold;
}

export default function AgeGate() {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!AGE_GATE_ENABLED) return; // skipped during build
    // Show the gate unless this browser already passed it.
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "true") setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    const d = Number(day);
    const m = Number(month);
    const y = Number(year);

    if (!d || !m || !y || y < 1900 || m < 1 || m > 12 || d < 1 || d > 31) {
      setError("Please enter a valid date of birth.");
      return;
    }
    const dob = new Date(y, m - 1, d);
    if (dob.getDate() !== d || dob.getMonth() !== m - 1) {
      setError("Please enter a valid date of birth.");
      return;
    }
    if (!isAtLeast(MIN_AGE, dob)) {
      window.location.href = "https://www.drinkaware.co.uk/";
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return (
    <div
      className="rc-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agegate-title"
    >
      <div className="rc-overlay-card">
        <div className="eyebrow eyebrow-center">Age verification</div>
        <h2 id="agegate-title" className="mb-2">
          Are you 18 or over?
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: ".9rem" }}>
          You must be of legal drinking age to enter. Please enter your date of
          birth.
        </p>

        <form onSubmit={confirm} noValidate>
          <div className="d-flex gap-2 justify-content-center my-3">
            <input
              className="form-control text-center"
              style={{ maxWidth: 80 }}
              inputMode="numeric"
              placeholder="DD"
              aria-label="Day"
              maxLength={2}
              value={day}
              onChange={(e) => setDay(e.target.value.replace(/\D/g, ""))}
            />
            <input
              className="form-control text-center"
              style={{ maxWidth: 80 }}
              inputMode="numeric"
              placeholder="MM"
              aria-label="Month"
              maxLength={2}
              value={month}
              onChange={(e) => setMonth(e.target.value.replace(/\D/g, ""))}
            />
            <input
              className="form-control text-center"
              style={{ maxWidth: 110 }}
              inputMode="numeric"
              placeholder="YYYY"
              aria-label="Year"
              maxLength={4}
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {error && (
            <p role="alert" style={{ color: "var(--red)", fontSize: ".8125rem" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-gold w-100">
            Enter
          </button>
        </form>

        <p style={{ fontSize: ".6875rem", color: "var(--text-dim)", marginTop: 16 }}>
          Please drink responsibly. Visit{" "}
          <a href="https://www.drinkaware.co.uk/" rel="noopener" target="_blank">
            drinkaware.co.uk
          </a>
          .
        </p>
      </div>
    </div>
  );
}
