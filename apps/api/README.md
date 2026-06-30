# CafeAtlas API

FastAPI backend for CafeAtlas AI.

## Setup

From `apps/api`:

```sh
python -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[test]"
```

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
