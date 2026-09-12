import { NetworkError } from '../../lib/api/client';

export const StatusPill = ({ status }) => {
  const styles = {
    passed: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    failed: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    running: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
    skipped: 'bg-zinc-500/15 text-fg-muted ring-zinc-500/30',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ${styles[status] || styles.skipped}`}
    >
      {status}
    </span>
  );
};

export const KpiCard = ({ label, value, hint, loading }) => (
  <article className="rounded-2xl border border-ink-border bg-ink-card p-4 shadow-glow">
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-fg-subtle">{label}</p>
    {loading ? (
      <div className="mt-3 h-8 w-24 animate-pulse rounded bg-fg/10" />
    ) : (
      <p className="mt-2 text-3xl font-semibold tracking-tight text-fg">{value}</p>
    )}
    {hint ? <p className="mt-2 text-sm text-fg-subtle">{hint}</p> : null}
  </article>
);

export const DataState = ({ loading, error, empty, onRetry, emptyMessage, children }) => {
  if (loading) {
    return (
      <div className="rounded-2xl border border-ink-border bg-ink-card p-8">
        <div className="h-4 w-40 animate-pulse rounded bg-fg/10" />
        <div className="mt-4 h-40 animate-pulse rounded-xl bg-fg/5" />
      </div>
    );
  }

  if (error) {
    const waking = error instanceof NetworkError || error.status === 0;
    return (
      <div className="rounded-2xl border border-ink-border bg-ink-card p-8 text-center">
        <p className="text-lg font-medium text-fg">
          {waking ? 'Waking the API…' : 'Could not load this view'}
        </p>
        <p className="mt-2 text-sm text-fg-muted">
          {waking
            ? 'The free-tier server may be cold. Wait a few seconds and retry.'
            : error.message}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-xl bg-ember px-4 py-2 text-sm font-medium text-white hover:bg-ember-2"
          >
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-ink-border bg-ink-card p-8 text-center">
        <p className="text-lg font-medium text-fg">Nothing in this slice</p>
        <p className="mt-2 text-sm text-fg-muted">
          {emptyMessage || 'No records match these filters. Try another project, range, or status.'}
        </p>
      </div>
    );
  }

  return children;
};

const selectClass =
  'rounded-xl border border-ink-border bg-ink-muted px-3 py-2 text-sm text-fg outline-none focus:border-ember/70';

export const FilterBar = ({
  projects,
  projectId,
  range,
  status,
  onProject,
  onRange,
  onStatus,
  children,
}) => (
  <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-border bg-ink-card p-3">
    <select className={selectClass} value={projectId} onChange={(event) => onProject(event.target.value)}>
      <option value="">All projects</option>
      {(projects || []).map((project) => (
        <option key={project.id} value={project.id}>
          {project.key} · {project.name}
        </option>
      ))}
    </select>
    <select className={selectClass} value={range} onChange={(event) => onRange(event.target.value)}>
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
    </select>
    <select className={selectClass} value={status} onChange={(event) => onStatus(event.target.value)}>
      <option value="">All statuses</option>
      <option value="passed">Passed</option>
      <option value="failed">Failed</option>
      <option value="running">Running</option>
    </select>
    {children}
  </div>
);
