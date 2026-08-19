export function Kpi({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
