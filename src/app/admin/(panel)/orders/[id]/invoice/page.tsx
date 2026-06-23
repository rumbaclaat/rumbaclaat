import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PrintButton from "@/components/admin/ui/print-button";

export const dynamic = "force-dynamic";

export default async function Invoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);
  if (!order) notFound();
  const cur = order.currency || "GBP";
  const vatRate = (settings?.vatRatePct ?? 20) / 100;
  const net = Number(order.total) / (1 + vatRate);
  const vat = Number(order.total) - net;
  const addr = (order.shippingAddress ?? {}) as Record<string, string>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 d-print-none">
        <h1 style={{ fontSize: "1.4rem" }}>VAT invoice — {order.ref}</h1>
        <PrintButton />
      </div>
      <div className="print-sheet">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700 }}>{settings?.businessName ?? "Rumbaclaat Limited"}</div>
            <div style={{ fontSize: 12, color: "#555", whiteSpace: "pre-line" }}>{settings?.businessAddress ?? "United Kingdom"}</div>
            {settings?.businessVat && <div style={{ fontSize: 12, color: "#555" }}>VAT: {settings.businessVat}</div>}
          </div>
          <div style={{ textAlign: "right", fontSize: 13 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>INVOICE</div>
            <div>{order.ref}</div>
            <div>{new Date(order.placedAt).toLocaleDateString("en-GB")}</div>
          </div>
        </div>
        <hr />
        <div style={{ fontSize: 13, marginBottom: 16 }}>
          <div style={{ fontWeight: 700 }}>Bill to</div>
          <div>{order.customerName ?? order.email}</div>
          <div>{[addr.line1, addr.city, addr.postcode, addr.country].filter(Boolean).join(", ")}</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
            <th style={{ padding: 6 }}>Item</th><th style={{ padding: 6 }}>Qty</th><th style={{ padding: 6, textAlign: "right" }}>Unit</th><th style={{ padding: 6, textAlign: "right" }}>Total</th>
          </tr></thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 6 }}>{i.name}</td>
                <td style={{ padding: 6 }}>{i.qty}</td>
                <td style={{ padding: 6, textAlign: "right" }}>{formatMoney(Number(i.unitPrice), cur)}</td>
                <td style={{ padding: 6, textAlign: "right" }}>{formatMoney(Number(i.lineTotal), cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginLeft: "auto", width: 260, marginTop: 12, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>Net</span><span>{formatMoney(net, cur)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}><span>VAT ({settings?.vatRatePct ?? 20}%)</span><span>{formatMoney(vat, cur)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontWeight: 700, borderTop: "1px solid #ccc" }}><span>Total</span><span>{formatMoney(Number(order.total), cur)}</span></div>
        </div>
        <p style={{ fontSize: 12, color: "#777", marginTop: 24 }}>Payment status: {order.paymentStatus}. Thank you for your business.</p>
      </div>
    </div>
  );
}
