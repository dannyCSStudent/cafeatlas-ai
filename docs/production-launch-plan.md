# CafeAtlas Production Launch Plan

This is the step-by-step path from the current local demo to an investor-ready hosted product. Complete each checkpoint before starting the next one.

## Recommended First Release Architecture

- **Database and authentication:** Supabase
- **API:** a managed Python service such as Render, Railway, or Fly.io
- **Web:** Vercel or another managed Next.js host
- **Payments:** Stripe test mode for the investor demo, then live mode only after business and payout details are verified
- **Mobile:** keep the Expo app pointed at the hosted API; publish a native build after the hosted web demo is stable
- **Domain:** one real HTTPS domain for the web app and a separate API subdomain, for example `app.example.com` and `api.example.com`

The exact providers can change. The required property is the same: the API and web app must be hosted separately, use HTTPS, and have independent production environment variables.

The included Render Blueprint uses the `free` compute plan for the investor demo. Free services may sleep when idle, so the first request after inactivity can be slow. The database remains in Supabase and is not stored on the API instance.

## Launch Gates

### Gate 0: Freeze The Demo Scope

For the first investor release, treat these as required:

- Web catalog, origins, coffee detail, account, cart, checkout, order receipt
- Supabase signup, login, logout, reset, and email confirmation
- Stripe checkout and a hosted webhook
- Club subscription checkout and cancellation behavior
- Admin order, inventory, review, wholesale, marketplace, affiliate, and analytics screens
- Mobile app pointed at the hosted API

Treat voice transcription as optional until OpenAI billing is available. Keep the browser recording and graceful error state, but do not make voice a launch blocker.

### Gate 1: Create Hosted Environments

Create or confirm:

1. A Supabase project for the demo or production database.
2. An API service with a stable HTTPS URL.
3. A web hosting project connected to this repository.
4. A domain or subdomain that you control.
5. A Stripe test-mode account with the required products, prices, and webhook access.

Do not use `localhost`, `127.0.0.1`, Expo ports, or a Stripe CLI listener in hosted environment variables.

### Gate 2: Configure Production Secrets

Set secrets in the hosting dashboards, not in git:

API service:

- `CAFEATLAS_ENVIRONMENT=production`
- `CAFEATLAS_DEBUG=false`
- `CAFEATLAS_DATABASE_URL` using the hosted Supabase Postgres connection string
- `CAFEATLAS_SUPABASE_URL`
- `CAFEATLAS_SUPABASE_ANON_KEY`
- `CAFEATLAS_SUPABASE_SERVICE_ROLE_KEY`
- `CAFEATLAS_STRIPE_SECRET_KEY`
- `CAFEATLAS_STRIPE_WEBHOOK_SECRET`
- `CAFEATLAS_STRIPE_CLUB_SEASONAL_PRICE_ID`
- `CAFEATLAS_STRIPE_CLUB_ORIGIN_PRICE_ID`
- `CAFEATLAS_STRIPE_CLUB_RESERVE_PRICE_ID`
- `CAFEATLAS_CORS_ORIGINS` containing only the hosted web and mobile-web origins
- `CAFEATLAS_OPENAI_API_KEY` only when credits are available

Web service:

- `CAFEATLAS_API_URL=https://api.example.com`
- `CAFEATLAS_SUPABASE_URL`
- `CAFEATLAS_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CAFEATLAS_SUPABASE_URL`
- `NEXT_PUBLIC_CAFEATLAS_SUPABASE_ANON_KEY`

Mobile build:

- `EXPO_PUBLIC_CAFEATLAS_API_URL_WEB=https://api.example.com`
- `EXPO_PUBLIC_CAFEATLAS_API_URL_NATIVE=https://api.example.com`
- `EXPO_PUBLIC_CAFEATLAS_SUPABASE_URL`
- `EXPO_PUBLIC_CAFEATLAS_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_CAFEATLAS_CHECKOUT_URL=https://app.example.com`

Never expose the API service-role key, Stripe secret key, Stripe webhook secret, or OpenAI key to web or mobile variables.

### Gate 3: Migrate And Verify The Hosted Database

Follow [the database migration procedure](database-migration.md) before deploying the API if the investor database is new. Alembic creates the schema; it does not transfer the local catalog and inventory.

Run the migration from the API deployment environment or a secured local shell using the hosted database URL:

```sh
cd apps/api
alembic upgrade head
alembic current
```

The result must show the current head revision `20261007_01`. Take a database backup or snapshot before this step. Do not use `Base.metadata.create_all()` as a production migration strategy.

The repository includes an API container at `apps/api/Dockerfile` and a Render blueprint at `render.yaml`. Render's free plan does not support `preDeployCommand`, so run the migration manually from a secured local shell before the first deploy:

```sh
alembic upgrade head
```

Run that command only after `CAFEATLAS_DATABASE_URL` points to the hosted database. Repeat it after each schema-changing release before deploying that release.

### Gate 4: Deploy And Probe The API

Use this process command on the API host:

```sh
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Verify these URLs from a browser or terminal:

```sh
curl -fsS https://api.example.com/api/v1/health
curl -fsS https://api.example.com/api/v1/health/ready
curl -fsS https://api.example.com/api/v1/version
curl -fsS https://api.example.com/
```

The `/health` endpoint is a liveness check. The `/health/ready` endpoint also executes a database query, and is the Render health check. Then verify that a request from the hosted web origin includes the expected CORS headers.

After both services are deployed, run the repository smoke script:

```sh
scripts/verify-deployment.sh https://api.example.com https://app.example.com
```

The script requires HTTPS and does not print environment variable values.

### Gate 5: Deploy The Web App

Configure the web host as a monorepo project with `apps/web` as the application directory. Confirm that the server-side `CAFEATLAS_API_URL` points to the hosted API, then run:

```sh
pnpm --dir apps/web lint
pnpm --dir apps/web build
```

Update Supabase authentication settings:

- Add the hosted web URL to the site URL.
- Add the hosted `/auth/confirm` URL to the redirect allowlist.
- Add the hosted password-reset confirmation URL to the redirect allowlist.
- Update email templates so links point to the hosted domain.

### Gate 6: Configure Stripe Webhooks

For the hosted API, create a Stripe test-mode webhook endpoint:

```text
https://api.example.com/api/v1/webhooks/stripe
```

Subscribe to the events used by the application, including checkout completion, checkout expiration, subscription creation, subscription updates, and subscription deletion. Store the endpoint's signing secret as `CAFEATLAS_STRIPE_WEBHOOK_SECRET` in the API host.

The Stripe CLI listener is for local development only. In the hosted demo, confirm the Stripe Dashboard shows a delivered event and the endpoint responds with HTTP `200`.

### Gate 7: Run The Release Smoke Test

Use a fresh test account and test-mode payment method. Verify:

1. Sign up and confirm the email.
2. Sign in and refresh the account page.
3. Browse the catalog and origins.
4. Add a coffee and marketplace product to the cart.
5. Complete checkout.
6. Confirm the hosted Stripe webhook updates the order.
7. Confirm the receipt and share/copy fallback.
8. Test Club checkout and confirm `active` status.
9. Test cancellation and confirm the period-end state.
10. Sign in as admin and verify orders, inventory, reviews, wholesale, marketplace, affiliates, and analytics.
11. Open the same account on mobile web and confirm it uses the hosted API.

Record the date, account, test payment ID, webhook event ID, and result. This becomes the investor demo evidence and the first incident-troubleshooting record.

### Gate 8: Security And Operations Review

Before showing investors:

- Rotate any secret that has ever been pasted into chat, terminal output, screenshots, or git history.
- Confirm `.env` files are ignored and no secret is tracked by git.
- Confirm production CORS contains no wildcard and no local origins.
- Confirm HTTPS is enforced for web, API, auth redirects, and Stripe URLs.
- Confirm admin access is limited to the intended Supabase user.
- Confirm database backups, error logs, and uptime alerts are enabled.
- Add privacy, terms, refund, shipping, and contact information before public sales.
- Keep Stripe in test mode for the investor demo unless the business is ready to accept real money.

## Definition Of Investor-Ready

The product is ready for an investor demonstration when the hosted web URL works without a local terminal, a fresh account can complete the main catalog-to-checkout flow, Stripe webhooks update the database, admin screens show the resulting records, mobile uses the same hosted backend, and the release smoke-test record is complete.

The product is ready for public launch only after the security, legal, backup, monitoring, support, and live-Stripe gates are also complete.
