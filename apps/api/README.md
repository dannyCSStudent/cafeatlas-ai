# CafeAtlas API

FastAPI backend for CafeAtlas AI.

## Setup

From `apps/api`:

```sh
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[test]"
```

`pnpm dev` runs the API with the system `python3` interpreter in this workspace, so it does not depend on a pre-populated `.venv`.

## Run

```sh
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Test

```sh
python -m pytest
```

## Seed

```sh
python seed.py
```

## Environment

Copy `.env.example` to `.env` when you start adding local overrides.

## Core variables

- `CAFEATLAS_DATABASE_URL`
- `CAFEATLAS_SUPABASE_URL`
- `CAFEATLAS_SUPABASE_ANON_KEY`
- `CAFEATLAS_SUPABASE_SERVICE_ROLE_KEY`
- `CAFEATLAS_OPENAI_API_KEY`
- `CAFEATLAS_STRIPE_SECRET_KEY`
- `CAFEATLAS_STRIPE_WEBHOOK_SECRET`

## Database layer

The backend now includes a reusable SQLAlchemy engine/session factory in `app/db/session.py`.
It expects `CAFEATLAS_DATABASE_URL` to be set before anything that touches the database is used.

## Migrations

Alembic is configured in `alembic.ini` with migration files under `migrations/`.

## Local PostgreSQL

On Debian-based systems, `systemctl start postgresql` starts the meta service, not necessarily the cluster.
Check the actual cluster status with:

```sh
pg_lsclusters
```

If the `16 main` cluster is down, start it with:

```sh
sudo pg_ctlcluster 16 main start
```

If you are using the `postgres` role in `CAFEATLAS_DATABASE_URL`, make sure that role has the password you configured:

```sh
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE cafeatlas OWNER postgres;"
```

The CORS env var accepts either comma-separated values or a JSON array string.
