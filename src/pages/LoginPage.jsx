import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/layout/ThemeToggle';

export const LoginPage = () => {
  const { user, checking, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('analyst@runboard.dev');
  const [password, setPassword] = useState('Runboard123!');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center text-fg-muted">Checking session…</div>;
  }

  if (user) {
    const to = location.state?.from || '/';
    return <Navigate to={to} replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink bg-grid px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-ink-border bg-ink-card p-8 shadow-glow">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ember">Runboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">Sign in to the desk</h1>
        <p className="mt-2 text-sm text-fg-muted">
          One loop: read coverage, change filters, open a test run.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm text-fg-muted">
            Email
            <input
              className="mt-1 w-full rounded-xl border border-ink-border bg-ink-muted px-3 py-2 text-fg outline-none focus:border-ember/70"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="block text-sm text-fg-muted">
            Password
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-ink-border bg-ink-muted px-3 py-2 text-fg outline-none focus:border-ember/70"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-ember py-2.5 text-sm font-medium text-white hover:bg-ember-2 disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-ink-border bg-ink-muted px-4 py-3 text-sm text-fg-muted">
          <p className="font-medium text-fg">Demo analyst</p>
          <p className="mt-1">analyst@runboard.dev</p>
          <p>Runboard123!</p>
        </div>
      </div>
    </div>
  );
};
