import { useEffect, useState } from 'react';
import { DataState, StatusPill } from '../components/ui/Primitives';
import { fetchProjects } from '../lib/api/metrics';
import { formatDateTime } from '../lib/format';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchProjects()
      .then((payload) => setProjects(payload.projects || []))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-ember">Projects</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg">Plans on this desk</h1>
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          Read-only in this demo. Keys match how a reporting module would switch tenant context.
        </p>
      </div>

      <DataState loading={loading} error={error} empty={!loading && projects.length === 0} onRetry={load}>
        <div className="grid gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="rounded-2xl border border-ink-border bg-ink-card p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-ember/15 px-2 py-1 text-xs font-semibold text-ember">
                  {project.key}
                </span>
                {project.lastRun ? <StatusPill status={project.lastRun.status} /> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-fg">{project.name}</h2>
              <p className="mt-2 text-sm text-fg-muted">
                {project.planCount} plans · {project.runCount} runs
              </p>
              <p className="mt-4 text-xs text-fg-subtle">
                Last run {project.lastRun ? `${project.lastRun.code} · ${formatDateTime(project.lastRun.startedAt)}` : '—'}
              </p>
            </article>
          ))}
        </div>
      </DataState>
    </div>
  );
};
