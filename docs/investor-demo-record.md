# CafeAtlas Investor Demo Record

Use this record for the hosted investor demonstration. Do not write secrets, full card numbers, or webhook signing secrets here.

## Hosted Services

- Web: `https://cafeatlas-ai.vercel.app`
- API: `https://cafeatlas-api.onrender.com`
- Database and authentication: Supabase
- Payments: Stripe test mode

## Automated Verification

- Verification date: `2026-10-11`
- Latest repository verification commit: `34fdeb1`
- API tests: `100 passed`
- Web lint and production build: passed
- Mobile TypeScript and lint checks: passed
- Hosted liveness: passed
- Hosted database readiness: passed
- Hosted API version: passed
- Hosted web availability: passed
- Production CORS for the Vercel origin: passed

## Manual Evidence

Record IDs only, never secret values.

- Test account email: `________________________________`
- Stripe test payment ID: `________________________________`
- Stripe `checkout.session.completed` event ID: `________________________________`
- CafeAtlas order ID: `________________________________`
- Final order status: `paid`
- Club subscription event ID, if tested: `________________________________`
- Admin fulfillment test result: `paid -> processing -> shipped -> delivered`

## Demo Smoke Test

- [ ] Hosted web opens without a local terminal running.
- [ ] New user can sign up, confirm email, sign in, and sign out.
- [ ] Catalog, origins, producer, farm, and coffee detail pages load.
- [ ] Web cart accepts a coffee and reaches Stripe Checkout.
- [ ] Stripe Dashboard shows a successful test payment.
- [ ] Hosted webhook delivery shows HTTP `200`.
- [ ] Render logs show the order transition.
- [ ] Account order becomes `PAID`.
- [ ] Receipt displays the paid order.
- [ ] Admin can move the order through fulfillment.
- [ ] Club checkout reaches Stripe and subscription status becomes `active`.
- [ ] Club cancellation changes the subscription to cancel at period end.
- [ ] Mobile web uses the hosted API and displays the same catalog data.

## Security Confirmation

- [ ] Render contains no local origins in `CAFEATLAS_CORS_ORIGINS`.
- [ ] Production Stripe webhook uses the Dashboard endpoint secret, not the CLI listener secret.
- [ ] Any credential previously exposed in chat, screenshots, or terminal output has been rotated.
- [ ] Supabase service-role and Stripe secret keys are not present in Vercel or mobile variables.
- [ ] Stripe remains in test mode for the investor demo.

## Open Before Public Sales

- Privacy policy
- Terms of service
- Shipping policy
- Refund and returns policy
- Contact/support address
- Database backup and restore procedure
- Monitoring and uptime alerts
- Live Stripe account and payout verification
