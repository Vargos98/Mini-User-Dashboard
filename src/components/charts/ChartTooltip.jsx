export const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-ink-border bg-ink-card px-3 py-2 text-xs text-fg shadow-lg">
      {label ? <p className="mb-1.5 font-medium text-fg-subtle">{label}</p> : null}
      <ul className="space-y-1">
        {payload.map((item) => {
          const name = item.name ?? item.dataKey;
          const raw = item.value;
          const display = formatter ? formatter(raw, name)?.[0] ?? raw : raw;
          const swatch = item.payload?.fill || item.color || '#fe320a';

          return (
            <li key={String(name)} className="flex items-center gap-2 text-fg">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: swatch }} />
              <span className="capitalize">{name}</span>
              <span className="font-semibold">{display}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
