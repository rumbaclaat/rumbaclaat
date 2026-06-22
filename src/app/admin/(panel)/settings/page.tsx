import { prisma } from "@/lib/prisma";
import { updateSettings } from "./actions";

export const dynamic = "force-dynamic";

const FIELDS: { name: string; label: string; step?: string; suffix?: string }[] = [
  { name: "shippingStandardCost", label: "Standard shipping cost (£)", step: "0.01" },
  { name: "shippingExpressCost", label: "Express shipping cost (£)", step: "0.01" },
  { name: "freeShippingThreshold", label: "Free shipping over (£)", step: "0.01" },
  { name: "pointsPerPound", label: "Points per £1 (redemption)", step: "1" },
  { name: "vatRatePct", label: "VAT rate (%)", step: "1" },
  { name: "ageThreshold", label: "Minimum age", step: "1" },
];

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const settings =
    (await prisma.settings.findUnique({ where: { id: "default" } })) ??
    (await prisma.settings.create({ data: { id: "default" } }));

  const val = (k: keyof typeof settings) => String(settings[k] ?? "");

  return (
    <>
      <div className="admin-page-head">
        <h1>Settings</h1>
      </div>

      {saved && (
        <div
          className="mb-3"
          role="status"
          style={{
            background: "rgba(74,222,128,.12)",
            border: "1px solid rgba(74,222,128,.35)",
            color: "var(--green)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: ".875rem",
          }}
        >
          ✓ Settings saved.
        </div>
      )}

      <form action={updateSettings} className="admin-card" style={{ maxWidth: 640 }}>
        <div className="row g-3">
          {FIELDS.map((f) => (
            <div className="col-sm-6" key={f.name}>
              <label className="form-label" htmlFor={f.name}>
                {f.label}
              </label>
              <input
                id={f.name}
                name={f.name}
                type="number"
                step={f.step}
                className="form-control"
                defaultValue={val(f.name as keyof typeof settings)}
              />
            </div>
          ))}
          <div className="col-sm-6">
            <label className="form-label" htmlFor="currency">
              Currency
            </label>
            <input
              id="currency"
              name="currency"
              className="form-control"
              defaultValue={settings.currency}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-gold mt-4">
          Save settings
        </button>
      </form>
    </>
  );
}
