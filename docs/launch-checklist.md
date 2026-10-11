# CafeAtlas Launch Checklist

Use this checklist before a partner demo or production deployment.

For the hosted deployment sequence, use [the production launch plan](production-launch-plan.md). This checklist covers the local and feature smoke tests used at each launch gate.

## Local Startup

- Confirm PostgreSQL is running with `pg_lsclusters`.
- Start the application cluster if needed: `sudo pg_ctlcluster 16 main start`.
- Confirm `apps/api/.env` contains the database, Supabase, Stripe, and web origin settings.
- Run migrations from `apps/api`: `alembic upgrade head`.
- Start the API on port `8000`.
- Start the web app on port `3000` and the mobile app with the Expo command used by the team.

## Required Secrets

- Keep `.env` files out of git and never paste secret values into logs, tickets, or chat.
- Rotate any API key that has been exposed.
- Supabase must have the correct URL and anon key in the API and mobile/web environments.
- Stripe must use test-mode keys and matching test-mode Price IDs during testing.
- For hosted deployment, `CAFEATLAS_STRIPE_WEBHOOK_SECRET` must match the signing secret from the Stripe Dashboard endpoint targeting the hosted API. The CLI listener secret is only for local development and must not be placed in Render.
- `CAFEATLAS_OPENAI_API_KEY` is only needed for voice transcription; the rest of the AI and brew features work without it.
- Voice transcription also requires available OpenAI API credits.

## Stripe Test Flow

For local development, start the listener before completing a payment:

```sh
stripe listen --events checkout.session.completed,checkout.session.expired,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted --forward-to http://127.0.0.1:8000/api/v1/webhooks/stripe
```

Verify the listener account and mode with `stripe whoami`. Use a test card, confirm the listener receives the event with HTTP `200`, and verify the order or Club subscription changes in the app.

For the hosted demo, do not run the CLI listener. Configure the Stripe test-mode Dashboard endpoint as:

```text
https://YOUR-RENDER-API.onrender.com/api/v1/webhooks/stripe
```

Store that endpoint's signing secret in Render, complete a test payment, and verify the Dashboard delivery is `200`, the Render logs show the order transition, and the account order becomes `paid`.

## Admin Setup

- Sign in with the Supabase account intended for administration.
- Set that account's Supabase metadata role to `admin`.
- Confirm the Admin page loads analytics, orders, reviews, wholesale requests, affiliates, and marketplace products.
- Create a marketplace product with inventory and confirm it appears on both web and mobile.

## Smoke Tests

- Sign in and sign out on web, mobile web, and Android emulator.
- Browse coffees, origins, marketplace products, coffee tourism, and brew assistant.
- Add coffee and marketplace products to the mobile cart together.
- Review inventory, save an order draft, add shipping, complete Stripe checkout, and confirm the webhook updates the order.
- Verify farmer analytics, customer analytics, affiliate attribution, Club subscription status, and admin fulfillment transitions.
- Confirm a mobile receipt can be shared or copied when native browser sharing is unavailable.
- Confirm voice input falls back cleanly when browser speech recognition is unavailable. Test transcription only after OpenAI credits are available.
- Confirm the API readiness endpoint returns `200` repeatedly during the smoke test; investigate any recurring `503` responses before the demo.

## Verification Commands

```sh
cd apps/api && python3 -m pytest
cd apps/web && pnpm lint && pnpm build
cd apps/mobile && pnpm exec tsc --noEmit && pnpm lint
```
