type SendArgs = { to: string; subject: string; html: string; text?: string; replyTo?: string };

/**
 * Sends an email via the Resend HTTP API. Key-aware: if RESEND_API_KEY is not
 * set, returns { sent:false, reason:"no_key" } so callers can still log the
 * message and surface a "add a key to go live" state. No SDK dependency.
 */
export async function sendEmail(args: SendArgs): Promise<{ sent: boolean; reason?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "Rumbaclaat <onboarding@resend.dev>";
  if (!key) return { sent: false, reason: "no_key" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
        reply_to: args.replyTo,
      }),
    });
    if (!res.ok) return { sent: false, reason: `http_${res.status}` };
    return { sent: true };
  } catch {
    return { sent: false, reason: "error" };
  }
}

/** Wraps body copy in a simple branded HTML shell for outgoing emails. */
export function emailShell(title: string, bodyHtml: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0E0E0E;color:#F5F0E8;font-family:Inter,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:28px">
    <div style="font-family:Georgia,serif;font-size:22px;color:#E4C77B;letter-spacing:.04em">Rumbaclaat<span style="color:#C6A75E">.</span></div>
    <h1 style="font-family:Georgia,serif;font-size:20px;color:#F5F0E8">${title}</h1>
    <div style="line-height:1.7;color:#CFC7B6">${bodyHtml}</div>
    <hr style="border:none;border-top:1px solid rgba(198,167,94,.18);margin:24px 0"/>
    <div style="font-size:12px;color:#9A927F">Rumbaclaat — Premium Caribbean Rum · 18+ only</div>
  </div></body></html>`;
}
