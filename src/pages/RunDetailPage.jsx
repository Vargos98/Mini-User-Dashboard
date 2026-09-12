import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { DataState, KpiCard, StatusPill } from '../components/ui/Primitives';
import { fetchRun } from '../lib/api/metrics';
import { formatDateTime, formatDuration } from '../lib/format';

export const RunDetailPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchRun(id)
      .then(setPayload)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const run = payload?.run;
  const totals = payload?.totals;

  return (
    <div className="space-y-6">
      <Link to={{ pathname: '/runs', search: params.toString() }} className="text-sm text-ember hover:text-ember-2">
        ← Back to test runs
      </Link>

      <DataState loading={loading} error={error} empty={!loading && !run} onRetry={load}>
        {run ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-ember">
                  {run.project.key} · {run.plan.name}
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg">{run.code}</h1>
                <p className="mt-2 text-sm text-fg-muted">
                  Triggered by {run.triggeredBy} · {formatDateTime(run.startedAt)}
                </p>
              </div>
              <StatusPill status={run.status} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard label="Passed" value={totals.passed} />
              <KpiCard label="Failed" value={totals.failed} />
              <KpiCard label="Skipped" value={totals.skipped} />
              <KpiCard label="Duration" value={formatDuration(run.durationMs)} />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-ink-border bg-ink-card">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-ink-border text-xs uppercase tracking-wider text-fg-subtle">
                  <tr>
                    <th className="px-4 py-3">Case</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {(run.results || []).length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-fg-subtle" colSpan={3}>
                        This run is still in progress, so case results are not in yet.
                      </td>
                    </tr>
                  ) : (
                    run.results.map((result) => (
                      <tr key={result.id} className="border-b border-ink-border/70 last:border-0">
                        <td className="px-4 py-3 text-fg">{result.name}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={result.status} />
                        </td>
                        <td className="px-4 py-3 text-fg-muted">{formatDuration(result.durationMs)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </DataState>
    </div>
  );
};
