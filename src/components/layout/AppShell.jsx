import { useEffect, useState } from 'react';
import { NavLink, Outlet, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboardFilters } from '../../hooks/useDashboardFilters';
import { fetchProjects } from '../../lib/api/metrics';
import { ThemeToggle } from './ThemeToggle';

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/runs', label: 'Test runs' },
  { to: '/projects', label: 'Projects' },
];

const navClass = ({ isActive }) =>
  `block rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-ember/15 text-ember' : 'text-fg-muted hover:bg-fg/5 hover:text-fg'
  }`;

export const AppShell = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [params] = useSearchParams();
  const filters = useDashboardFilters();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects()
      .then((payload) => setProjects(payload.projects || []))
      .catch(() => setProjects([]));
  }, []);

  const query = params.toString();

  return (
    <div className="min-h-screen bg-ink bg-grid">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 border-r border-ink-border bg-ink-muted transition-transform md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="px-4 py-5">
            <p className="text-lg font-semibold tracking-tight text-fg">Runboard</p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-fg-subtle">QA analytics desk</p>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={{ pathname: link.to, search: query }}
                end={link.end}
                className={navClass}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <p className="px-4 py-4 text-xs text-fg-faint">Coverage, run analytics, plan metrics.</p>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-ink-border bg-ink/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-ink-border px-2 py-1 text-sm text-fg-muted md:hidden"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
            <select
              className="rounded-xl border border-ink-border bg-ink-card px-3 py-2 text-sm text-fg outline-none focus:border-ember/70"
              value={filters.projectId}
              onChange={(event) => filters.setProjectId(event.target.value)}
            >
              <option value="">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.key}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-fg">{user?.name}</p>
              <p className="text-xs text-fg-subtle">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-ink-border px-3 py-2 text-sm text-fg-muted hover:bg-fg/5"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
