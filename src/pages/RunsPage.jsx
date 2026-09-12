import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DataState, FilterBar, StatusPill } from '../components/ui/Primitives';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { fetchProjects, fetchRuns } from '../lib/api/metrics';
import { formatDateTime, formatDuration } from '../lib/format';

const columns = [
  { key: 'code', label: 'Run' },
  { key: 'startedAt', label: 'Started' },
  { key: 'status', label: 'Status' },
  { key: 'durationMs', label: 'Duration' },
];

export const RunsPage = () => {
  const filters = useDashboardFilters();
  const [params] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState(filters.q);
  const [payload, setPayload] = useState({ runs: [], total: 0, pageCount: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectPayload, runPayload] = await Promise.all([
        fetchProjects(),
        fetchRuns({
          ...filters.apiFilters,
          q: filters.q,
          page: filters.page,
          sort: filters.sort,
          order: filters.order,
        }),
      ]);
      setProjects(projectPayload.projects || []);
      setPayload(runPayload);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filters.apiFilters, filters.q, filters.page, filters.sort, filters.order]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setSearch(filters.q);
  }, [filters.q]);

  const onSearch = (event) => {
    event.preventDefault();
    filters.setQuery(search.trim());
  };

  const query = params.toString();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-ember">Test runs</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg">Sortable run history</h1>
      </div>

      <FilterBar
        projects={projects}
        projectId={filters.projectId}
        range={filters.range}
        status={filters.status}
        onProject={filters.setProjectId}
        onRange={filters.setRange}
        onStatus={filters.setStatus}
      >
        <form onSubmit={onSearch} className="flex min-w-[220px] flex-1 gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search code, plan, owner…"
            className="w-full rounded-xl border border-ink-border bg-ink-muted px-3 py-2 text-sm text-fg outline-none focus:border-ember/70"
          />
          <button
            type="submit"
            className="rounded-xl bg-fg/10 px-3 py-2 text-sm text-fg hover:bg-fg/15"
          >
            Search
          </button>
        </form>
      </FilterBar>

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && payload.runs.length === 0}
        onRetry={load}
      >
        <div className="overflow-x-auto rounded-2xl border border-ink-border bg-ink-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink-border text-xs uppercase tracking-wider text-fg-subtle">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3">
                    <button
                      type="button"
                      className="hover:text-fg"
                      onClick={() => filters.setSort(column.key)}
                    >
                      {column.label}
                      {filters.sort === column.key ? (filters.order === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Owner</th>
              </tr>
            </thead>
            <tbody>
              {payload.runs.map((run) => (
                <tr key={run.id} className="border-b border-ink-border/70 last:border-0 hover:bg-fg/[0.04]">
                  <td className="px-4 py-3 font-medium text-ember">
                    <Link to={{ pathname: `/runs/${run.id}`, search: query }}>{run.code}</Link>
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{formatDateTime(run.startedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={run.status} />
                  </td>
                  <td className="px-4 py-3 text-fg-muted">{formatDuration(run.durationMs)}</td>
                  <td className="px-4 py-3 text-fg-muted">{run.project.key}</td>
                  <td className="px-4 py-3 text-fg-muted">{run.plan.name}</td>
                  <td className="px-4 py-3 text-fg-subtle">{run.triggeredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-sm text-fg-muted">
          <p>
            {payload.total} runs · page {payload.page} of {payload.pageCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={filters.page <= 1}
              onClick={() => filters.setPage(filters.page - 1)}
              className="rounded-lg border border-ink-border px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={filters.page >= payload.pageCount}
              onClick={() => filters.setPage(filters.page + 1)}
              className="rounded-lg border border-ink-border px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </DataState>
    </div>
  );
};
