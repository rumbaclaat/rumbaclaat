"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerCustomer } from "@/app/(site)/account/actions";

export default function AccountAuth({
  registered,
  errorCode,
}: {
  registered?: boolean;
  errorCode?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(registered ? "login" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    errorCode === "exists"
      ? "An account with that email already exists."
      : errorCode === "invalid"
        ? "Enter a valid email and a password of at least 8 characters."
        : ""
  );
  const [loading, setLoading] = useState(false);

  async function onLogin(e: React.FormEvent) {
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
    router.push("/account");
    router.refresh();
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="text-center mb-4">
          <span className="eyebrow eyebrow-center">Inner Circle</span>
          <h1>My Account</h1>
        </div>

        <div className="billing-toggle mb-4" role="group" aria-label="Login or register" style={{ display: "flex", width: "100%" }}>
          <button type="button" className={`btn btn-sm flex-grow-1 ${mode === "login" ? "btn-gold" : "btn-outline-gold"}`} onClick={() => setMode("login")}>Sign in</button>
          <button type="button" className={`btn btn-sm flex-grow-1 ${mode === "register" ? "btn-gold" : "btn-outline-gold"}`} onClick={() => setMode("register")}>Create account</button>
        </div>

        {registered && mode === "login" && (
          <div role="status" className="mb-3" style={{ background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.35)", color: "var(--green)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>✓ Account created. Sign in below.</div>
        )}
        {error && (
          <div role="alert" className="mb-3" style={{ background: "rgba(242,109,109,.12)", border: "1px solid rgba(242,109,109,.35)", color: "var(--red)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>{error}</div>
        )}

        <div className="card-brand">
          {mode === "login" ? (
            <form onSubmit={onLogin}>
              <div className="mb-3"><label className="form-label" htmlFor="l-email">Email</label><input id="l-email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
              <div className="mb-4"><label className="form-label" htmlFor="l-pass">Password</label><input id="l-pass" type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
              <button type="submit" className="btn btn-gold w-100" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
            </form>
          ) : (
            <form action={registerCustomer}>
              <div className="row g-2 mb-3">
                <div className="col-6"><label className="form-label" htmlFor="r-first">First name</label><input id="r-first" name="firstName" className="form-control" /></div>
                <div className="col-6"><label className="form-label" htmlFor="r-last">Last name</label><input id="r-last" name="lastName" className="form-control" /></div>
              </div>
              <div className="mb-3"><label className="form-label" htmlFor="r-email">Email</label><input id="r-email" name="email" type="email" className="form-control" autoComplete="email" required /></div>
              <div className="mb-3"><label className="form-label" htmlFor="r-pass">Password</label><input id="r-pass" name="password" type="password" className="form-control" autoComplete="new-password" minLength={8} required /><div style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 4 }}>At least 8 characters.</div></div>
              <button type="submit" className="btn btn-gold w-100">Create free account</button>
              <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 10, marginBottom: 0 }}>Free Bronze membership — 5% off, points on every order. 18+ only.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
