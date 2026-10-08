# CafeAtlas Database Migration

Use a separate Supabase project for the investor deployment unless the existing project is already dedicated to CafeAtlas and contains no data that must be preserved. Never run the destructive restore commands against a shared or live customer database.

## 1. Create A Hosted Database

In Supabase, create or select the investor project and open **Connect**. Copy a PostgreSQL connection URI privately. Do not paste it into chat, git, screenshots, or tickets.

The URI must point to the hosted Supabase database and include SSL. It must not contain `localhost`, `127.0.0.1`, or the local PostgreSQL port.

## 2. Back Up Local Data

From the repository root, replace the placeholders locally and run:

```sh
pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file=/tmp/cafeatlas-local.dump \
  "postgresql://LOCAL_USER:LOCAL_PASSWORD@LOCAL_HOST:LOCAL_PORT/cafeatlas"
```

Confirm the dump exists before continuing:

```sh
ls -lh /tmp/cafeatlas-local.dump
```

## 3. Prepare The Hosted Schema

Run the migrations against the hosted database, not the local database:

```sh
cd apps/api
CAFEATLAS_DATABASE_URL="POSTGRESQL_HOSTED_URI" alembic upgrade head
CAFEATLAS_DATABASE_URL="POSTGRESQL_HOSTED_URI" alembic current
```

The current revision must be `20261007_01`.

## 4. Copy Demo Catalog Data

For a new investor-only Supabase project, restore the local demo database:

```sh
pg_restore \
  --no-owner \
  --no-privileges \
  --dbname="POSTGRESQL_HOSTED_URI" \
  /tmp/cafeatlas-local.dump
```

Run the migration check again afterward. If the restore reports that a table already exists, stop and inspect the output; do not add `--clean` until you have confirmed the database is disposable.

The PostgreSQL restore does not copy Supabase Auth users. Create or invite the investor/admin accounts in Supabase Auth, then set the intended administrator's user metadata role to `admin` using the existing project procedure.

## 5. Verify Before Deploying The API

```sh
PGPASSWORD='HOSTED_PASSWORD' psql \
  --host=HOSTED_HOST \
  --port=HOSTED_PORT \
  --username=HOSTED_USER \
  --dbname=HOSTED_DATABASE \
  -c 'SELECT version_num FROM alembic_version;'
```

Verify that the catalog contains coffees, producers, farms, and inventory before entering the same hosted URI as `CAFEATLAS_DATABASE_URL` in Render.

## Empty Investor Database: Seed Instead

If the hosted database has the schema but no catalog rows, and the baseline demo catalog is sufficient, run the repository seed directly against Supabase. This does not require the local PostgreSQL cluster to be running:

```sh
cd apps/api
read -r -s HOSTED_DB_URL
printf '\n'
CAFEATLAS_ENVIRONMENT=development CAFEATLAS_DATABASE_URL="$HOSTED_DB_URL" python3 seed.py
unset HOSTED_DB_URL
```

The seed is idempotent for its baseline records. It creates the demo coffees, producers, farms, states, and events. Use the full backup and restore procedure above when you need to preserve additional local orders, marketplace rows, pricing tiers, or other records.
