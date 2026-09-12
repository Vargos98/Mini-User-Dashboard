const btn = (active) =>
  `rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition ${
    active ? 'bg-ember/15 text-ember' : 'text-fg-subtle hover:text-fg'
  }`;

export const TypeToggle = ({ options, value, onChange }) => (
  <div className="flex rounded-xl border border-ink-border bg-ink-muted p-0.5">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        className={btn(value === option.value)}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const ChartCard = ({ title, types, type, onType, extra, children }) => (
  <section className="rounded-2xl border border-ink-border bg-ink-card p-4">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-sm font-medium text-fg-muted">{title}</h2>
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {types ? <TypeToggle options={types} value={type} onChange={onType} /> : null}
      </div>
    </div>
    <div className="h-72 chart-plot">{children}</div>
  </section>
);
