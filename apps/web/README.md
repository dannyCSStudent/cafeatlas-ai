# CafeAtlas Web

The web app is the public catalog for CafeAtlas AI.

## Local development

1. Start the backend API in `apps/api`.
2. Set the API base URL for the web app:

```bash
cp .env.example .env.local
```

3. Run the app:

```bash
pnpm dev
```

The storefront reads the paginated coffee catalog from the FastAPI backend and supports filter/sort query params directly in the URL.

## Environment

- `CAFEATLAS_API_URL`: backend base URL used by server-rendered catalog fetches.
