import { formatMoney } from "@/lib/money";

// Champagne chart palette (gold ramp + a couple of semantics) for donut/ranked fills.
const PALETTE = ["#CDB582", "#E6D2A0", "#8A7440", "#6FCF97", "#E8B65A", "#8C8678", "#CD7F32"];

/**
 * Vertical bars in a fixed-height plot, with a separate aligned label row.
 * Per-bar value labels are intentionally dropped — surface the total in the
 * card-head badge where the chart is used (champagne rule: restrained charts).
 */
export function BarChart({ data, money = false }: { data: { label: string; value: number }[]; money?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="admin-chart">
      <div className="admin-bars">
        {data.map((d, i) => (
          <div
            className="admin-bar-col"
            key={`${d.label}-${i}`}
            title={`${d.label}: ${money ? formatMoney(d.value) : d.value}`}
          >
            <div className="admin-bar" style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="admin-bar-axis">
        {data.map((d, i) => (
          <span key={`${d.label}-${i}`}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/** Ranked horizontal bars — far more legible for long-labelled series (top products). */
export function RankedBars({ data, money = false }: { data: { label: string; value: number }[]; money?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="admin-rank">
      {data.map((d, i) => (
        <div className="admin-rank-row" key={`${d.label}-${i}`}>
          <span className="lbl" title={d.label}>{d.label}</span>
          <span className="admin-rank-track">
            <span className="admin-rank-fill" style={{ width: `${Math.max(2, (d.value / max) * 100)}%` }} />
          </span>
          <span className="val">{money ? formatMoney(d.value) : d.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/** A tiny inline sparkline for hero stats. */
export function Sparkline({ data, height = 38 }: { data: number[]; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${(i * step).toFixed(1)},${(height - ((v - min) / range) * (height - 4) - 2).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" width="100%" height={height} aria-hidden="true" style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke="var(--gold-hi)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Donut({
  segments,
  centerValue,
  centerLabel,
  money = false,
}: {
  segments: { label: string; value: number; color?: string }[];
  centerValue?: string | number;
  centerLabel?: string;
  money?: boolean;
}) {
  const total = Math.max(1, segments.reduce((a, s) => a + s.value, 0));
  let acc = 0;
  const stops = segments.map((s, i) => {
    const start = (acc / total) * 100;
    acc += s.value;
    const end = (acc / total) * 100;
    return `${s.color ?? PALETTE[i % PALETTE.length]} ${start}% ${end}%`;
  });
  return (
    <div className="admin-donut-wrap">
      <div className="admin-donut" style={{ background: `conic-gradient(${stops.join(", ")})` }}>
        <div className="admin-donut-center">
          <span className="n">{centerValue ?? total}</span>
          {centerLabel && <span className="l">{centerLabel}</span>}
        </div>
      </div>
      <div className="admin-legend">
        {segments.map((s, i) => (
          <div className="admin-legend-item" key={`${s.label}-${i}`}>
            <span className="admin-legend-dot" style={{ background: s.color ?? PALETTE[i % PALETTE.length] }} />
            <span style={{ textTransform: "capitalize" }}>{s.label}</span>
            <span className="admin-legend-val">{money ? formatMoney(s.value) : s.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
