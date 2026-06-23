import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/money";
import PrintButton from "@/components/admin/ui/print-button";

export const dynamic = "force-dynamic";

export default async function PackingSlip({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  const addr = (order.shippingAddress ?? {}) as Record<string, string>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 d-print-none">
        <h1 style={{ fontSize: "1.4rem" }}>Packing slip — {order.ref}</h1>
        <PrintButton />
      </div>
      <div className="print-sheet">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700 }}>Rumbaclaat</div>
            <div style={{ fontSize: 12, color: "#555" }}>Packing slip</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 13 }}>
            <div><strong>{order.ref}</strong></div>
            <div>{new Date(order.placedAt).toLocaleDateString("en-GB")}</div>
          </div>
        </div>
        <hr />
        <div style={{ display: "flex", gap: 40, fontSize: 13, marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Ship to</div>
            <div>{order.customerName ?? order.email}</div>
            <div>{[addr.line1, addr.line2].filter(Boolean).join(", ")}</div>
            <div>{[addr.city, addr.postcode].filter(Boolean).join(", ")}</div>
            <div>{addr.country}</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Delivery</div>
            <div>{order.deliveryMethod ?? "Standard"}</div>
            {order.trackingNumber && <div>{order.trackingCarrier} {order.trackingNumber}</div>}
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}><th style={{ padding: 6 }}>Item</th><th style={{ padding: 6 }}>Qty</th></tr></thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 6 }}>{i.name}</td>
                <td style={{ padding: 6 }}>{i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 12, color: "#777", marginTop: 24 }}>Thank you for your order. Drink responsibly · 18+ only.</p>
        <div style={{ textAlign: "right", fontSize: 12, color: "#999" }}>{order.items.reduce((a, b) => a + b.qty, 0)} items · {formatMoney(Number(order.total), order.currency)}</div>
      </div>
    </div>
  );
}
