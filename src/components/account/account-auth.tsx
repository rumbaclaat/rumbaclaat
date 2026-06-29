"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { registerCustomer } from "@/app/(site)/account/actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface2)",
  border: "1px solid var(--line2)",
  color: "var(--text)",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: ".9rem",
  outline: "none",
  fontFamily: "var(--sans)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "var(--muted)",
  fontSize: ".78rem",
  marginBottom: 6,
};

export default function AccountAuth({
  registered,
  errorCode,
}: {
  registered?: boolean;
  errorCode?: string;
}) {
  const router = useRouter();
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

  return (
    <div data-screen-label="Sign in / Join">
      <section
        style={{
          position: "relative",
          padding:
            "clamp(48px,7vw,84px) clamp(20px,5vw,40px) clamp(72px,9vw,110px)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(80% 70% at 50% 0%, rgba(205,181,130,.1), transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", maxWidth: 940, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span
              style={{
                fontSize: ".74rem",
                letterSpacing: ".24em",
                textTransform: "uppercase",
                color: "var(--gold)",
                fontWeight: 600,
              }}
            >
              RPM Members
            </span>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontWeight: 600,
                fontSize: "clamp(2rem,4.4vw,3rem)",
                lineHeight: 1.05,
                margin: "12px 0 0",
              }}
            >
              My Account
            </h1>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "1.02rem",
                margin: "12px auto 0",
                maxWidth: 440,
              }}
            >
              Sign in to your account, or create one free to start earning points
              on every order.
            </p>
          </div>

          {registered && (
            <div
              role="status"
              style={{
                maxWidth: 600,
                margin: "0 auto 20px",
                background: "rgba(74,222,128,.12)",
                border: "1px solid rgba(74,222,128,.35)",
                color: "var(--green)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: ".875rem",
                textAlign: "center",
              }}
            >
              ✓ Account created. Sign in below.
            </div>
          )}
          {notice && (
            <div
              role="status"
              style={{
                maxWidth: 600,
                margin: "0 auto 20px",
                background: "rgba(74,222,128,.12)",
                border: "1px solid rgba(74,222,128,.35)",
                color: "var(--green)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: ".875rem",
                textAlign: "center",
              }}
            >
              {notice}
            </div>
          )}
          {error && (
            <div
              role="alert"
              style={{
                maxWidth: 600,
                margin: "0 auto 20px",
                background: "rgba(242,109,109,.12)",
                border: "1px solid rgba(242,109,109,.35)",
                color: "var(--red)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: ".875rem",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* Sign in */}
            <form
              onSubmit={onLogin}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line2)",
                borderRadius: 18,
                padding: "30px 28px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  margin: "0 0 4px",
                }}
              >
                Sign in
              </h2>
              <p
                style={{
                  color: "var(--dim)",
                  fontSize: ".86rem",
                  margin: "0 0 22px",
                }}
              >
                Welcome back.
              </p>
              <label style={labelStyle} htmlFor="l-email">
                Email
              </label>
              <input
                id="l-email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                style={{ ...inputStyle, marginBottom: 16 }}
              />
              <label style={labelStyle} htmlFor="l-pass">
                Password
              </label>
              <input
                id="l-pass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ ...inputStyle, marginBottom: 10 }}
              />
              <button
                type="button"
                onClick={onForgot}
                style={{
                  display: "inline-block",
                  color: "var(--dim)",
                  fontSize: ".8rem",
                  cursor: "pointer",
                  marginBottom: 20,
                  background: "none",
                  border: 0,
                  padding: 0,
                  fontFamily: "var(--sans)",
                }}
              >
                Forgot password?
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: "var(--gold)",
                  color: "var(--onGold)",
                  border: "none",
                  borderRadius: 999,
                  padding: 13,
                  fontSize: ".92rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--sans)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            {/* Create account */}
            <form
              action={registerCustomer}
              style={{
                background:
                  "linear-gradient(165deg, rgba(205,181,130,.14), var(--card))",
                border: "1px solid var(--gold)",
                borderRadius: 18,
                padding: "30px 28px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  margin: "0 0 4px",
                }}
              >
                Create account
              </h2>
              <p
                style={{
                  color: "var(--muted)",
                  fontSize: ".86rem",
                  margin: "0 0 22px",
                }}
              >
                Join free — instantly enrolled at Bronze. No card required.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={labelStyle} htmlFor="r-first">
                    First name
                  </label>
                  <input
                    id="r-first"
                    name="firstName"
                    autoComplete="given-name"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="r-last">
                    Last name
                  </label>
                  <input
                    id="r-last"
                    name="lastName"
                    autoComplete="family-name"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
              <label style={labelStyle} htmlFor="r-email">
                Email
              </label>
              <input
                id="r-email"
                name="email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                required
                style={{ ...inputStyle, marginBottom: 16 }}
              />
              <label style={labelStyle} htmlFor="r-pass">
                Password
              </label>
              <input
                id="r-pass"
                name="password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                required
                style={{ ...inputStyle, marginBottom: 16 }}
              />
              <label style={labelStyle} htmlFor="r-dob">
                Date of birth
              </label>
              <input
                id="r-dob"
                name="dateOfBirth"
                type="date"
                autoComplete="bday"
                required
                style={{ ...inputStyle, marginBottom: 16 }}
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  color: "var(--muted)",
                  fontSize: ".8rem",
                  marginBottom: 20,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  required
                  style={{ marginTop: 3, accentColor: "var(--gold)" }}
                />
                <span>
                  I am 18+ and agree to the{" "}
                  <a
                    href="/terms"
                    style={{ color: "var(--goldHi)" }}
                  >
                    Terms &amp; Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    style={{ color: "var(--goldHi)" }}
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "transparent",
                  color: "var(--goldHi)",
                  border: "1px solid var(--gold)",
                  borderRadius: 999,
                  padding: 13,
                  fontSize: ".92rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--sans)",
                }}
              >
                Create free account
              </button>
              <p
                style={{
                  color: "var(--dim)",
                  fontSize: ".74rem",
                  lineHeight: 1.5,
                  margin: "14px 0 0",
                }}
              >
                By joining you confirm you are 18 or over. See our privacy policy
                for how we handle your data.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
