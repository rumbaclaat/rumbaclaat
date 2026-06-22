"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="rc-overlay" style={{ position: "fixed", inset: 0 }}>
      <div className="rc-overlay-card" style={{ maxWidth: 400 }}>
        <div className="brand-wordmark mb-2" style={{ fontSize: "1.5rem" }}>
          Rumbaclaat<span className="dot">.</span>
        </div>
        <div className="eyebrow eyebrow-center">Admin</div>
        <h1 className="h4 mb-4">Sign in</h1>

        <form onSubmit={onSubmit} className="text-start" noValidate>
          {error && (
            <div
              role="alert"
              className="mb-3"
              style={{
                background: "rgba(242,109,109,.12)",
                border: "1px solid rgba(242,109,109,.35)",
                color: "var(--red)",
                borderRadius: 8,
                fontSize: ".8125rem",
                padding: "8px 12px",
              }}
            >
              {error}
            </div>
          )}
          <div className="mb-3">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-gold w-100" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
