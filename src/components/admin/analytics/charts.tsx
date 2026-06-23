import { formatMoney } from "@/lib/money";

const PALETTE = ["#C6A75E", "#E4C77B", "#4ADE80", "#F26D6D", "#FBBF24", "#9A927F", "#CD7F32"];

export function BarChart({ data, money = false }: { data: { label: string; value: number }[]; money?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="admin-bars">
      {data.map((d, i) => (
        <div className="admin-bar-col" key={`${d.label}-${i}`} title={`${d.label}: ${money ? formatMoney(d.value) : d.value}`}>
          <span className="admin-bar-val">{money ? `£${Math.round(d.value)}` : d.value}</span>
          <div className="admin-bar" style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
          <span className="admin-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: { label: string; value: number; color?: string }[];
  centerValue?: string | number;
  centerLabel?: string;
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
          <div className="admin-legend-item" key={s.label}>
            <span className="admin-legend-dot" style={{ background: s.color ?? PALETTE[i % PALETTE.length] }} />
            {s.label} · {s.value}
          </div>
        ))}
      </div>
    </div>
  );
}
