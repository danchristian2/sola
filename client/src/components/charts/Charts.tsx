import { BLUE } from "../../ui/theme";

type Slice = { label: string; value: number; color: string };

export function BarChart({
  labels,
  values,
  colors = BLUE
}: {
  labels: string[];
  values: number[];
  colors?: string[];
}) {
  const max = Math.max(...values, 1);
  const width = 420;
  const height = 180;
  const gap = 10;
  const barW = (width - gap * (values.length + 1)) / values.length;

  return (
    <svg viewBox={`0 0 ${width} ${height + 28}`} className="h-44 w-full">
      {values.map((value, index) => {
        const h = (value / max) * height;
        const x = gap + index * (barW + gap);
        const y = height - h;
        return (
          <g key={labels[index]}>
            <rect x={x} y={y} width={barW} height={h} rx={2} fill={colors[index % colors.length]} />
            <text x={x + barW / 2} y={height + 18} textAnchor="middle" fill="#64748b" fontSize="11">
              {labels[index]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AreaChart({
  points,
  color = "#2563eb",
  fill = "rgba(37,99,235,0.12)"
}: {
  points: number[];
  color?: string;
  fill?: string;
}) {
  const width = 420;
  const height = 170;
  const max = Math.max(...points, 1);
  const step = width / Math.max(points.length - 1, 1);
  const coords = points.map((p, i) => [i * step, height - (p / max) * (height - 12) - 6] as const);
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function DonutChart({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" className="h-32 w-32 shrink-0">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        {slices.map((slice) => {
          const len = (slice.value / total) * c;
          const dash = `${len} ${c - len}`;
          const el = (
            <circle
              key={slice.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="66" textAnchor="middle" fill="#1e3a8a" fontSize="16" fontWeight="600">
          {total}
        </text>
        <text x="70" y="82" textAnchor="middle" fill="#64748b" fontSize="10">
          total
        </text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5 text-sm">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: slice.color }} />
            <span className="truncate text-muted-foreground">{slice.label}</span>
            <span className="ml-auto tabular-nums">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HorzBars({ rows }: { rows: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={row.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-foreground">{row.label}</span>
            <span className="tabular-nums text-muted-foreground">{row.value}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full"
              style={{ width: `${(row.value / max) * 100}%`, background: row.color ?? BLUE[i % BLUE.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
