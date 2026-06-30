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
