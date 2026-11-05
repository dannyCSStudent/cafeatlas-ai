# CafeAtlas v0 Design Handoff

## Objective

Refine the hosted web experience into a premium, editorial destination for
Mexican coffee while preserving the already-tested product behavior. This is a
web design pass, not a backend or payment rewrite.

## Product Position

CafeAtlas AI is a discovery platform for Mexican coffee: origin, producer, farm,
process, tasting notes, education, and commerce should feel like one connected
story. The visual direction should feel premium, warm, geographic, and
editorial rather than like a generic ecommerce template.

## Safe Scope

Prioritize these public web surfaces:

- Home and global navigation
- Coffee catalog, filters, and search
- Coffee, producer, farm, and state detail pages
- Cart and checkout preparation
- Club landing page
- Learn hub and article pages
- Events, marketplace, passport, and newsletter sections
- Responsive mobile-web layout

Admin, authentication, API routes, database models, Stripe integration, and the
Expo app are functional systems. Do not redesign their data contracts or move
their business logic into client-only mock data.

## Protected Contracts

- Preserve all existing routes and route parameters.
- Preserve Supabase auth flows, including confirmation and password reset.
- Preserve cart persistence and checkout behavior.
- Preserve the server-side newsletter proxy at `/api/newsletter`.
- Preserve Stripe checkout redirects and order/webhook status handling.
- Preserve accessibility semantics, keyboard navigation, and form errors.
- Keep API calls routed through the existing client helpers and Next.js proxy
  routes.
- Do not add secret or service-role keys to browser code.

## Visual Direction

- Use a strong typographic hierarchy with an expressive display face and a
  highly readable supporting face.
- Use coffee, parchment, volcanic earth, agave, and highland green tones with
  clear contrast rather than a flat white interface.
- Use editorial composition, origin map cues, lot cards, provenance markers,
  and restrained texture or gradients to create place.
- Use purposeful motion for page entry, catalog reveal, and image transitions;
  avoid motion on every control.
- Design mobile-first and verify the existing desktop experience after each
  major change.

## Acceptance Checks

After every design change, verify:

1. `pnpm --dir apps/web lint`
2. `pnpm --dir apps/web build`
3. Anonymous catalog and detail pages load from the hosted API.
4. Signup, login, account, cart, newsletter, and Stripe checkout still work.
5. Admin routes remain functional and protected.
6. No localhost API URLs or secrets are introduced.

Work on a branch or separate v0-generated pull request. Review the diff before
merging; reject changes that replace real data with placeholders or modify
auth, checkout, webhook, or API behavior.
