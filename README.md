# EcoTrack

A sustainability habit tracker. Users log eco-friendly actions, earn points
toward a monthly goal, take quizzes, read curated environmental news and chat
with an AI coach.

The repository holds two pieces: an Express + MongoDB REST API (`backend/`) and
a React Native / Expo mobile client (`frontend/`).

---

## Architecture

```
┌──────────────────────┐        x-auth-token (JWT)        ┌────────────────────┐
│  React Native app    │ ───────────────────────────────► │  Express API       │
│  (Expo, frontend/)   │ ◄─────────────────────────────── │  (backend/)        │
└──────────────────────┘             JSON                 └─────────┬──────────┘
                                                                    │ mongoose
                                                          ┌─────────▼──────────┐
                                                          │  MongoDB Atlas     │
                                                          └────────────────────┘
                                                                    ▲
                                    ┌───────────────────────────────┴───────────┐
                                    │ external APIs (optional, feature-gated)   │
                                    │ NewsAPI · YouTube Data API · Google Gemini│
                                    └───────────────────────────────────────────┘
```

The API is deployed as a container on Fly.io. Images are built from
`backend/Dockerfile` with `backend/` as the build context.

### Backend layout

| Path | Role |
| --- | --- |
| `server.js` | Entrypoint: loads env, connects to MongoDB, listens |
| `app.js` | Builds and exports the Express app — no side effects, so tests can import it |
| `config/db.js` | The single place the mongoose connection is opened |
| `routes/` | Route definitions and their auth requirements |
| `controllers/` | Request handlers |
| `models/` | Mongoose schemas: User, Goal, Activity, QuizScore, Message |
| `services/` | Outbound calls to NewsAPI, YouTube and Gemini |
| `utils/authMiddleware.js` | Verifies the `x-auth-token` JWT, sets `req.userId` |
| `utils/errorHandler.js` | Terminal error middleware; maps mongoose validation failures to 400 |
| `tests/` | Jest suites — `unit/`, `integration/`, `e2e/` |

### Data model

- **User** — name, email (unique, lowercased), bcrypt-hashed password, phone,
  address, `ecoPoints`
- **Goal** — one logged action, tied to a user, with a `topic` restricted to six
  categories and `pointsEarned` defaulting to 10
- **Activity** — one document per user holding an array of logged actions plus
  `monthlyGoal` (default 30)
- **QuizScore** — score history
- **Message** — virtual-coach conversation turns

Logging an action writes a `Goal`, appends to the user's `Activity` array and
increments `ecoPoints` by 10.

---

## API

Authentication is a JWT sent in an `x-auth-token` header, issued on register or
login and valid for 7 days.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | — | Plain-text liveness banner |
| GET | `/health` | — | `{status, database, uptime}`; 503 while mongoose is disconnected |
| GET | `/metrics` | — | Process uptime, memory usage and a request counter |
| POST | `/api/auth/register` | — | Create an account, returns a token |
| POST | `/api/auth/login` | — | Exchange credentials for a token |
| GET | `/api/auth/me` | ✔ | The authenticated user, without the password |
| POST | `/api/goals` | ✔ | Log an action |
| GET | `/api/goals` | ✔ | The caller's goals, newest first |
| GET | `/api/goals/activities` | ✔ | The caller's activity document |
| GET | `/api/goals/progress` | ✔ | Percentage of the monthly goal, capped at 100 |
| GET | `/api/news` | — | Environmental headlines via NewsAPI |
| GET | `/api/news/videos` | — | Sustainability videos via the YouTube Data API |
| POST | `/api/quiz/score` | ✔ | Save a quiz result, awards 10 points per correct answer |
| GET | `/api/quiz/history` | ✔ | Past quiz scores |
| GET | `/api/quiz/tips` | — | Static educational tips |
| POST | `/api/coach` | ✔ | Send a message to the AI coach |
| GET | `/api/coach` | ✔ | Conversation history |
| GET | `/api/profile/:userId` | ✔ | Profile plus goals, quiz scores and activity |
| PUT | `/api/profile/:userId` | ✔ | Update `firstName`, `lastName`, `phone`, `address` |
| DELETE | `/api/profile/:userId` | ✔ | Delete the account and all related data |

`/api/profile/*` additionally requires that `:userId` match the token subject;
a mismatch is a 403.

The news, video and coach endpoints depend on third-party API keys. Without
them the news and video services log an error and return an empty array, and
the coach returns a fallback message — the app runs, those features are just
empty.

---

## Running locally

### Prerequisites

Node.js 20 and a MongoDB connection string (Atlas or local). Docker is optional.

### 1. Configure the environment

```bash
cp .env.example .env
```

Fill in at least `MONGODB_URI` and `JWT_SECRET`. `.env` is gitignored; never
commit it. Every variable the backend reads is documented in `.env.example`.

### 2. Run the API

With Docker Compose, from the repository root:

```bash
docker compose up --build
```

Or directly:

```bash
cd backend
npm ci
npm run dev        # nodemon; `npm start` for a plain node process
```

The API listens on port 8080. Check it with:

```bash
curl localhost:8080/health
```

### 3. Run the mobile client

```bash
cd frontend
npm install
npx expo start
```

> **Known issue:** the client's API base URL is hard-coded, and inconsistently.
> `frontend/api.js` points at `http://localhost:5000` while the screen
> components point at `http://192.168.56.1:5000` — and the backend listens on
> **8080**, not 5000. Until those are reconciled (ideally into one configurable
> base URL), the app will not reach the API without editing those files.

### Tests

```bash
cd backend
npm test                  # everything
npm run test:unit         # pure units, with coverage into reports/unit
npm run test:integration  # HTTP routes via supertest
npm run test:e2e          # full user journeys
```

Integration and e2e suites start an in-process MongoDB via
`mongodb-memory-server`, so no live database is needed. The first run downloads
a mongod binary (pinned in `backend/package.json` under `config`) and caches it.

Lint and dependency audit, the same two commands CI runs:

```bash
npx eslint .
npm audit --audit-level=moderate
```

---

## Pipeline

Three workflows in `.github/workflows/`:

### `ci.yml` — on push to `main` and on every pull request

| Job | What it does |
| --- | --- |
| `unit` / `integration` / `e2e` | Run the three jest suites in parallel, each uploading its coverage as an artifact |
| `security` | `eslint` and `npm audit --audit-level=moderate`, both able to fail the build |
| `docker-build` | Builds `backend/Dockerfile` so image breakage surfaces before deploy |
| `observability` | Placeholder step; emits a reminder, no metrics are shipped |
| `deploy` | Deploys to Fly.io |

`deploy` requires all of `unit`, `integration`, `e2e`, `security` and
`docker-build` to pass, and is additionally gated on
`github.event_name == 'push' && github.ref == 'refs/heads/main'` so that pull
requests never deploy. It runs in the `production` GitHub environment.

### `deploy.yml` — on push to `dev`, `staging` or `prod`, or manually

Runs the same tests, lint and audit in a `verify` job, then deploys. Nothing
reaches Fly.io without the suite passing.

### `backup.yml` — nightly at 00:00 UTC, or manually

`mongodump --archive --gzip` of the Atlas database, uploaded to S3 under
`ecotrack/YYYY/MM/`. The archive is size-checked before upload so bad
credentials fail the run instead of storing an empty file. AWS access is via
GitHub OIDC role assumption.

It needs three repository secrets and fails with a clear message until they
exist:

| Secret | Purpose |
| --- | --- |
| `MONGODB_URI` | Atlas connection string for a user with the `backup` role |
| `AWS_BACKUP_ROLE_ARN` | IAM role to assume via OIDC, with `s3:PutObject` on the bucket |
| `AWS_BACKUP_BUCKET` | Destination bucket |

Retention is left to an S3 lifecycle rule, so the workflow needs no delete
permission.

### Deployment target

Fly.io, configured by `backend/fly.toml` (app `ecotrackapp`, region `bom`,
internal port 8080), using the `FLY_APP` secret as the API token.
`backend/fly.blue.toml` and `backend/fly.green.toml` describe blue/green apps
but are not referenced by any workflow, so a blue/green rollout is a manual
operation.

---

## Container image

`backend/Dockerfile` builds on `node:20-slim`, installs with `npm ci --omit=dev`,
runs as the unprivileged `node` user, and declares a `HEALTHCHECK` against
`/health` — which reports 503 while the database is unreachable, so an instance
that cannot serve requests is marked unhealthy rather than merely running.

The build context is `backend/`, matching `docker-compose.yml` and the
`flyctl deploy --remote-only ./backend` calls in both workflows.

---

## Further documentation

`docs/` holds tutorials, how-tos and reference material, indexed by
[`docs/index.md`](docs/index.md).
