# Runboard

QA / test-run analytics desk. Sign in, read coverage and run stats, change filters, open a run.

This repo started as an empty Vite scaffold named Mini User Dashboard. It is now a small **reporting product**: KPI cards, stacked charts, a filterable runs table, and a run detail page — all backed by a real API. Aggregation happens on the server, not in the browser.

React is pinned to **18** on purpose (not 19), so the public work also shows a previous React generation.

---

## Product loop

1. Log in as the demo analyst.
2. Land on **Overview**: 4 KPI cards + 2 stacked charts.
3. Change **project**, **date range** (7d / 30d / 90d), or **status**. Cards and charts refetch from the API.
4. Open **Test runs**: search, sort, paginate.
5. Open one run: passed / failed / skipped cases, duration, owner.
6. Optionally click **Record sample run** so the numbers are yours, not only seed data.

If a recruiter can do that in about 90 seconds, the card works.

---

## Stack

| Layer | Choice |
|---|---|
| UI | React 18, Vite, Tailwind CSS, React Router 6, Recharts |
| API | Express, Prisma, JWT (httpOnly cookie), Zod |
| Local DB | SQLite (zero Docker) |
| Production DB | PostgreSQL (same family as Fiesta) |

No signup, OAuth, websockets, CSV export, or Jira clone. One reporting loop, fully wired.

---

## Demo account

```
email:    analyst@runboard.dev
password: Runboard123!
```

---

## Local workflow

You need **two terminals**: API first, then the Vite app.

### 1. Install

From the repo root:

```bash
npm install
cd server
npm install
```

### 2. Environment

`server/.env` is already set for local SQLite. If you cloned a fresh copy:

```bash
cd server
cp .env.example .env
```

Root `.env` is optional. Leave `VITE_API_URL` empty so Vite proxies `/api` to `http://localhost:4001`.

### 3. Database and seed

From `server/`:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

Seed rebuilds 3 projects (`PAY`, `AUTH`, `CORE`), ~40 runs, and ~200 case results, plus the demo user.

### 4. Run

Terminal A, from the repo root:

```bash
npm run server:dev
```

API listens on `http://localhost:4001` (4000 is often Fiesta on the same machine).

Terminal B, from the repo root:

```bash
npm run dev
```

App listens on `http://localhost:5173`. Open that URL, sign in with the demo account.

---

## How the app is put together

```
src/                     React 18 client (Vite)
  pages/                 Login, Overview, Test runs, Run detail, Projects
  components/layout/     Sidebar + top bar (project switcher, user, logout)
  lib/api/               fetch wrapper, same idea as Fiesta's src/lib/api
  hooks/                 URL search params = filters (shareable, sticky across pages)

server/                  Express API
  prisma/schema.prisma   SQLite for local
  prisma/schema.postgres.prisma   PostgreSQL for Render
  src/modules/           auth, projects, metrics, runs
```

### Auth

`POST /api/auth/login` sets an httpOnly `runboard_token` cookie. `GET /api/auth/me` is the session. Protected routes return **401** on a missing or expired token.

In local dev, the Vite proxy keeps the cookie first-party (`localhost:5173` → `/api` → `:4000`).

### Filters and metrics

The client sends `projectId`, `from`, `to`, and `status`. It does not compute pass rate or chart series.

| Endpoint | Used for |
|---|---|
| `GET /api/metrics/summary` | KPI cards (runs, pass rate, failed, avg duration) |
| `GET /api/metrics/runs-over-time` | Stacked runs (passed / failed / running) |
| `GET /api/metrics/status-breakdown` | Stacked cases (passed / failed / skipped) |
| `GET /api/runs` | Table (search, sort, page) |
| `GET /api/runs/:id` | Detail |
| `POST /api/runs/sample` | Record a sample run |
| `GET /api/projects` | Project switcher + Projects page |

Zod validates query params. Filters that match nothing return **empty arrays / zeros**, not 500s.

Pass rate = passed cases / total cases in the current filter window.

### UI states

Every data view has loading, error, and empty. If the API is unreachable (typical of a sleeping free-tier host), the UI says **Waking the API…** instead of spinning forever.

---

## Data model

Small enough to aggregate, not a QA platform.

- **User** — email, password hash, name
- **Project** — name, key (`PAY`, `AUTH`, `CORE`)
- **TestPlan** — name, projectId
- **TestRun** — code, planId, status (`passed` / `failed` / `running`), startedAt, durationMs, triggeredBy
- **TestCaseResult** — runId, name, status (`passed` / `failed` / `skipped`), durationMs

---

## Production notes

Same split as Fiesta:

- Frontend → Vercel (`https://runboard-bice.vercel.app`, `VITE_API_URL` = public API origin)
- API + Postgres → Render (`https://runboard-api.onrender.com`)
  - `DATABASE_URL` = Postgres (`basic-256mb`; Render allows only one free database per workspace)
  - `CLIENT_ORIGIN` = Vercel URL
  - `CROSS_SITE_COOKIES=true`
  - build command: `npm run build:render` (uses `schema.postgres.prisma`, pushes, seeds)

Demo credentials belong in this README and on the portfolio card.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite client |
| `npm run server:dev` | Express with `--watch` |
| `npm run server:seed` | Re-seed the database |
| `npm run build` | Production client bundle |

---

## What this is not

Not a Jira clone, not signup/OAuth, not role matrices, not live websocket updates, not CSV/PDF export. Those inflate time and look unfinished if any one of them is half-done.
