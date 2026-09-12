import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChartCard, TypeToggle } from '../components/charts/ChartCard';
import { MixChart } from '../components/charts/MixChart';
import { SeriesChart } from '../components/charts/SeriesChart';
import { FilterBar, KpiCard, DataState } from '../components/ui/Primitives';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import {
  createSampleRun,
  fetchProjects,
  fetchRunsOverTime,
  fetchStatusBreakdown,
  fetchSummary,
} from '../lib/api/metrics';
import { formatDay, formatDuration } from '../lib/format';

const RUN_SERIES = [
  { key: 'passed', fill: '#34d399', name: 'Passed' },
  { key: 'failed', fill: '#f87171', name: 'Failed' },
  { key: 'running', fill: '#38bdf8', name: 'Running' },
];

const CASE_SERIES = [
  { key: 'passed', fill: '#34d399', name: 'Passed' },
  { key: 'failed', fill: '#f87171', name: 'Failed' },
  { key: 'skipped', fill: '#ffb100', name: 'Skipped' },
];

const STACK_TYPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'area', label: 'Area' },
  { value: 'line', label: 'Line' },
];

const MIX_TYPES = [
  { value: 'donut', label: 'Donut' },
  { value: 'pie', label: 'Pie' },
];

const TREND_METRICS = [
  { value: 'passRate', label: 'Pass rate' },
  { value: 'avgDurationMs', label: 'Duration' },
];

const TREND_TYPES = [
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
];

const withLabels = (series) =>
  series.map((row) => ({
    ...row,
    label: formatDay(row.date),
  }));

export const OverviewPage = () => {
  const filters = useDashboardFilters();
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [runsSeries, setRunsSeries] = useState([]);
  const [caseSeries, setCaseSeries] = useState([]);
  const [caseTotals, setCaseTotals] = useState({ passed: 0, failed: 0, skipped: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [recording, setRecording] = useState(false);
  const [runView, setRunView] = useState('bar');
  const [caseView, setCaseView] = useState('area');
  const [mixView, setMixView] = useState('donut');
  const [trendMetric, setTrendMetric] = useState('passRate');
  const [trendView, setTrendView] = useState('line');
  const hasData = useRef(false);

  useEffect(() => {
    fetchProjects()
      .then((payload) => setProjects(payload.projects || []))
      .catch(() => setProjects([]));
  }, []);

  const load = useCallback(async () => {
    if (hasData.current) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [summaryPayload, runsPayload, casesPayload] = await Promise.all([
        fetchSummary(filters.apiFilters),
        fetchRunsOverTime(filters.apiFilters),
        fetchStatusBreakdown(filters.apiFilters),
      ]);
      setSummary(summaryPayload);
      setRunsSeries(runsPayload.series || []);
      setCaseSeries(casesPayload.series || []);
      setCaseTotals(casesPayload.totals || { passed: 0, failed: 0, skipped: 0 });
      hasData.current = true;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.apiFilters]);

  useEffect(() => {
    load();
  }, [load]);

  const onSample = async () => {
    setRecording(true);
    try {
      await createSampleRun(filters.projectId || undefined);
      await load();
    } catch (err) {
      setError(err);
    } finally {
      setRecording(false);
    }
  };

  const runChart = useMemo(() => withLabels(runsSeries), [runsSeries]);
  const caseChart = useMemo(() => withLabels(caseSeries), [caseSeries]);
  const mixData = useMemo(
    () => [
      { name: 'passed', value: caseTotals.passed, fill: '#34d399' },
      { name: 'failed', value: caseTotals.failed, fill: '#f87171' },
      { name: 'skipped', value: caseTotals.skipped, fill: '#ffb100' },
    ],
    [caseTotals]
  );
  const trendSeries = useMemo(
    () => [
      {
        key: trendMetric,
        fill: trendMetric === 'passRate' ? '#fe320a' : '#ffb100',
        name: trendMetric === 'passRate' ? 'Pass rate' : 'Avg duration',
      },
    ],
    [trendMetric]
  );
  const trendFormatter =
    trendMetric === 'passRate' ? (value) => `${value}%` : (value) => formatDuration(value);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-ember">Overview</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg">Coverage and run stats</h1>
        </div>
        <button
          type="button"
          onClick={onSample}
          disabled={recording}
          className="rounded-xl border border-ember/40 bg-ember/10 px-4 py-2 text-sm font-medium text-ember hover:bg-ember/20 disabled:opacity-60"
        >
          {recording ? 'Recording…' : 'Record sample run'}
        </button>
      </div>

      <FilterBar
        projects={projects}
        projectId={filters.projectId}
        range={filters.range}
        status={filters.status}
        onProject={filters.setProjectId}
        onRange={filters.setRange}
        onStatus={filters.setStatus}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Runs"
          value={summary?.totalRuns ?? '—'}
          hint="Matching current filters"
          loading={loading}
        />
        <KpiCard
          label="Pass rate"
          value={summary ? `${summary.passRate}%` : '—'}
          hint="Passed cases / total cases"
          loading={loading}
        />
        <KpiCard
          label="Failed runs"
          value={summary?.failedRuns ?? '—'}
          hint="Runs that finished red"
          loading={loading}
        />
        <KpiCard
          label="Avg duration"
          value={summary ? formatDuration(summary.avgDurationMs) : '—'}
          hint="Completed runs only"
          loading={loading}
        />
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && summary?.totalRuns === 0}
        onRetry={load}
      >
        <div className={`grid gap-4 xl:grid-cols-2 ${refreshing ? 'opacity-70' : 'opacity-100'}`}>
          <ChartCard title="Runs over time" types={STACK_TYPES} type={runView} onType={setRunView}>
            <SeriesChart data={runChart} series={RUN_SERIES} type={runView} />
          </ChartCard>
          <ChartCard
            title="Case results over time"
            types={STACK_TYPES}
            type={caseView}
            onType={setCaseView}
          >
            <SeriesChart data={caseChart} series={CASE_SERIES} type={caseView} />
          </ChartCard>
          <ChartCard title="Coverage mix" types={MIX_TYPES} type={mixView} onType={setMixView}>
            <MixChart
              data={mixData}
              type={mixView}
              centerLabel={summary ? `${summary.passRate}%` : '—'}
              centerHint="pass rate"
            />
          </ChartCard>
          <ChartCard
            title="Trend"
            extra={<TypeToggle options={TREND_METRICS} value={trendMetric} onChange={setTrendMetric} />}
            types={TREND_TYPES}
            type={trendView}
            onType={setTrendView}
          >
            <SeriesChart
              data={runChart}
              series={trendSeries}
              type={trendView}
              yTickFormatter={trendFormatter}
            />
          </ChartCard>
        </div>
      </DataState>
    </div>
  );
};
