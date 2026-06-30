# CafeAtlas AI

CafeAtlas AI is a Turborepo monorepo for building a premium Mexican coffee discovery platform across web, mobile, and backend services.

## Structure

- `apps/web`: Next.js web experience
- `apps/mobile`: Expo / React Native mobile app
- `apps/api`: FastAPI backend
- `packages/ui`: Shared UI primitives
- `packages/eslint-config`: Shared linting rules
- `packages/typescript-config`: Shared TypeScript configs

## Development

From the repository root:

```sh
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

## Vision

The product is not an ecommerce template.

It is a discovery platform focused on premium Mexican coffee, with room to expand into storytelling, AI-assisted recommendations, maps, and eventually broader regional products.
