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
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
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
    setNotice("");
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

  async function onForgot() {
    setError("");
    setNotice("");
    if (!email) {
      setError("Enter your email address above, then tap “Forgot password”.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email);
    setNotice("If that email has an account, we’ve sent a password reset link.");
  }

  const isLogin = mode === "login";

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="text-center mb-4">
          <span className="eyebrow eyebrow-center">{isLogin ? "Member Access" : "Join Free"}</span>
          <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 8, marginBottom: 0, fontSize: ".9375rem" }}>
            {isLogin
              ? "Sign in to access your account and rewards dashboard."
              : "Free Bronze membership — instant member pricing and points on every order."}
          </p>
        </div>

        <div className="billing-toggle mb-4" role="group" aria-label="Login or register" style={{ display: "flex", width: "100%" }}>
          <button type="button" className={`btn btn-sm flex-grow-1 ${isLogin ? "btn-gold" : "btn-outline-gold"}`} onClick={() => setMode("login")}>Sign in</button>
          <button type="button" className={`btn btn-sm flex-grow-1 ${!isLogin ? "btn-gold" : "btn-outline-gold"}`} onClick={() => setMode("register")}>Create account</button>
        </div>

        {registered && isLogin && (
          <div role="status" className="mb-3" style={{ background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.35)", color: "var(--green)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>✓ Account created. Sign in below.</div>
        )}
        {notice && (
          <div role="status" className="mb-3" style={{ background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.35)", color: "var(--green)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>{notice}</div>
        )}
        {error && (
          <div role="alert" className="mb-3" style={{ background: "rgba(242,109,109,.12)", border: "1px solid rgba(242,109,109,.35)", color: "var(--red)", borderRadius: 8, padding: "8px 12px", fontSize: ".875rem" }}>{error}</div>
        )}

        <div className="card-brand">
          {isLogin ? (
            <form onSubmit={onLogin}>
              <div className="mb-3"><label className="form-label" htmlFor="l-email">Email</label><input id="l-email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
              <div className="mb-2"><label className="form-label" htmlFor="l-pass">Password</label><input id="l-pass" type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
              <div className="d-flex justify-content-end mb-4">
                <button type="button" className="btn-link-gold" onClick={onForgot} style={{ background: "none", border: 0, padding: 0, color: "var(--gold-hi)", fontSize: ".8125rem", cursor: "pointer" }}>Forgot password?</button>
              </div>
              <button type="submit" className="btn btn-gold w-100" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
            </form>
          ) : (
            <form action={registerCustomer}>
              <div className="row g-2 mb-3">
                <div className="col-6"><label className="form-label" htmlFor="r-first">First name</label><input id="r-first" name="firstName" className="form-control" autoComplete="given-name" /></div>
                <div className="col-6"><label className="form-label" htmlFor="r-last">Last name</label><input id="r-last" name="lastName" className="form-control" autoComplete="family-name" /></div>
              </div>
              <div className="mb-3"><label className="form-label" htmlFor="r-email">Email</label><input id="r-email" name="email" type="email" className="form-control" autoComplete="email" required /></div>
              <div className="mb-3"><label className="form-label" htmlFor="r-dob">Date of birth</label><input id="r-dob" name="dateOfBirth" type="date" className="form-control" required /><div style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 4 }}>You must be 18 or over to join.</div></div>
              <div className="mb-3"><label className="form-label" htmlFor="r-pass">Password</label><input id="r-pass" name="password" type="password" className="form-control" autoComplete="new-password" minLength={8} required /><div style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 4 }}>At least 8 characters.</div></div>
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="r-terms" required />
                <label className="form-check-label" htmlFor="r-terms" style={{ fontSize: ".8125rem", color: "var(--text-muted)" }}>
                  I am 18 or over and agree to the <a href="/terms" className="gold">Terms</a> and <a href="/privacy" className="gold">Privacy Policy</a>.
                </label>
              </div>
              <button type="submit" className="btn btn-gold w-100">Create free account</button>
              <p style={{ fontSize: ".75rem", color: "var(--text-dim)", marginTop: 10, marginBottom: 0 }}>Free Bronze membership — 5% off, points on every order. 18+ only.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
