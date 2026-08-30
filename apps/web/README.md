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
- `CAFEATLAS_SUPABASE_URL`: Supabase project URL for auth requests.
- `CAFEATLAS_SUPABASE_ANON_KEY`: Supabase anon key used by the web auth flow.
- `NEXT_PUBLIC_CAFEATLAS_SUPABASE_URL` and `NEXT_PUBLIC_CAFEATLAS_SUPABASE_ANON_KEY` are also supported.
- `EXPO_PUBLIC_CAFEATLAS_SUPABASE_URL` and `EXPO_PUBLIC_CAFEATLAS_SUPABASE_ANON_KEY` are also supported so the web app can reuse the same env file as mobile during local development.
- Set the Supabase email template for confirm signup to `{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`.
- Add `http://localhost:3000/` to the Supabase redirect URL allowlist if you want local signup verification to work.
- Add `http://localhost:3000/auth/reset-password/confirm` to the Supabase redirect URL allowlist if you want the password reset flow to work locally.
