# CafeAtlas Operations Runbook

Use this guide when the hosted investor demo shows an infrastructure or payment problem. Never put secret values in this document or in support messages.

## Service Health

Run the deployment verifier first:

```sh
scripts/verify-deployment.sh https://cafeatlas-api.onrender.com https://cafeatlas-ai.vercel.app
```

Interpret the checks in order:

- Liveness failure: inspect the Render deploy and service logs.
- Database readiness failure: inspect Supabase status, pooler limits, and the Render `CAFEATLAS_DATABASE_URL`; do not run repeated checkout attempts until readiness is stable.
- Version failure: confirm the Render service deployed the intended Git commit.
- Web failure: inspect the Vercel deployment and production environment variables.
- CORS failure: set `CAFEATLAS_CORS_ORIGINS` to the exact Vercel origin without a trailing slash, then redeploy Render.

## Stripe Webhooks

For hosted testing, Stripe Dashboard must target:

```text
https://cafeatlas-api.onrender.com/api/v1/webhooks/stripe
```

The Render value for `CAFEATLAS_STRIPE_WEBHOOK_SECRET` must come from that Dashboard endpoint. A `stripe listen` secret is only for a local API forwarded to `127.0.0.1`.

For a successful hosted checkout, verify all three locations:

1. Stripe Dashboard shows `checkout.session.completed` with a successful payment.
2. Stripe webhook delivery shows HTTP `200`.
3. Render logs show the order transition and the account order becomes `paid`.

If the order remains `checkout_pending`, compare the Checkout Session ID from Stripe with the order's `stripe_session_id` in Supabase. A missing match means the checkout and API are using different accounts or databases. A webhook response of `{"received": false}` means the API has no configured webhook secret.

## Database Readiness

The API uses a bounded SQLAlchemy pool. If readiness intermittently returns `503`:

- Confirm the Supabase database is available.
- Confirm Render uses the hosted PostgreSQL URI, not the Supabase HTTPS project URL.
- Check for pooler max-client errors in Render logs.
- Confirm the API is running the latest connection-pool code.
- Re-run the readiness probe before retrying a payment.

Do not change the production database schema manually. Apply migrations with Alembic and verify the current revision before deployment.

## Fulfillment

The valid order sequence is:

```text
paid -> processing -> shipped -> delivered
```

Canceling the tracking prompts must leave the order unchanged. Enter a tracking number before advancing to `shipped`; the tracking URL is optional.

## Secret Response

If a credential appears in chat, a screenshot, terminal output, or Git history:

1. Revoke or rotate it at the provider immediately.
2. Update only the hosting environment that needs it.
3. Redeploy the affected service.
4. Verify the relevant health, auth, payment, or webhook flow.
5. Record only the rotation date and affected service, never the secret.
