/**
 * Minimal PayPal Orders v2 server client (Checkout). Sandbox or live is chosen
 * by PAYPAL_ENV. The client secret is server-only — never import this from a
 * client component.
 */
const ENV = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
const BASE = ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export const paypalConfigured = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);

async function accessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials are not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET).");
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status}): ${json?.error_description ?? ""}`);
  return json.access_token as string;
}

/** Create a PayPal order for the given (server-computed) amount. Returns the PayPal order id. */
export async function ppCreateOrder(amount: number, currency = "GBP", referenceId?: string): Promise<{ id: string }> {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: currency, value: amount.toFixed(2) },
          ...(referenceId ? { reference_id: referenceId } : {}),
        },
      ],
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.id) throw new Error(`PayPal create-order failed (${res.status}): ${json?.message ?? "unknown"}`);
  return { id: json.id as string };
}

/** Capture an approved PayPal order. Returns status (expect "COMPLETED") + the capture id. */
export async function ppCaptureOrder(orderId: string): Promise<{ status: string; captureId?: string; amount?: string }> {
  const token = await accessToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`PayPal capture failed (${res.status}): ${json?.message ?? "unknown"}`);
  const cap = json?.purchase_units?.[0]?.payments?.captures?.[0];
  return { status: json?.status as string, captureId: cap?.id, amount: cap?.amount?.value };
}

export const paypalEnv = ENV;
