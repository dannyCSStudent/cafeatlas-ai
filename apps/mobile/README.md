# CafeAtlas Mobile

The mobile app is the handheld catalog for CafeAtlas AI.

## Local development

1. Start the FastAPI backend in `apps/api`.
2. Set the API base URL:

```bash
cp .env.example .env.local
```

3. Run the app:

```bash
pnpm dev
```

## Notes

- Use `EXPO_PUBLIC_CAFEATLAS_API_URL_NATIVE=http://10.0.2.2:8000` for Android emulators.
- Use `EXPO_PUBLIC_CAFEATLAS_API_URL_WEB` only when you need to force a specific backend host. If it is unset or still points at loopback, the web client falls back to the current browser host on port `8000`.
- The generic `EXPO_PUBLIC_CAFEATLAS_API_URL` variable is still supported, but the platform-specific values are safer when you run both browser and emulator.
- The app reads the live coffee catalog plus producer and farm routes from FastAPI.
- Mobile auth now uses `expo-secure-store` on native and localStorage on web for session persistence.

## Environment

- `EXPO_PUBLIC_CAFEATLAS_API_URL_NATIVE`
- `EXPO_PUBLIC_CAFEATLAS_API_URL_WEB`
- `EXPO_PUBLIC_CAFEATLAS_CHECKOUT_URL`
- `EXPO_PUBLIC_CAFEATLAS_SUPABASE_URL`
- `EXPO_PUBLIC_CAFEATLAS_SUPABASE_ANON_KEY`

## Hosted EAS build

Run these commands from `apps/mobile` after installing or invoking the EAS CLI:

```bash
npm install --global eas-cli
eas login
eas init
```

Use the EAS project environments to add these **plain-text** variables to both
the `preview` and `production` environments:

```text
EXPO_PUBLIC_CAFEATLAS_API_URL_NATIVE=https://cafeatlas-api.onrender.com
EXPO_PUBLIC_CAFEATLAS_API_URL_WEB=https://cafeatlas-api.onrender.com
EXPO_PUBLIC_CAFEATLAS_CHECKOUT_URL=https://cafeatlas-ai.vercel.app
EXPO_PUBLIC_CAFEATLAS_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_CAFEATLAS_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

The Supabase URL and publishable/anon key are safe client variables. Never add
the Supabase service-role key, Stripe secret, Stripe webhook secret, or OpenAI
key to EAS.

For the first investor test on Android, build an installable preview APK:

```bash
eas build --platform android --profile preview
```

Install the APK from the completed EAS build page, then test catalog loading,
account sign-in, cart checkout, order history, and Club checkout. A store-ready
build uses:

```bash
eas build --platform all --profile production
```

The production build requires Apple and Google developer credentials. Do not
submit it to the stores until the hosted investor smoke test passes.
