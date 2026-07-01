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
- Use `EXPO_PUBLIC_CAFEATLAS_API_URL_WEB=http://127.0.0.1:8000` for Expo web.
- The generic `EXPO_PUBLIC_CAFEATLAS_API_URL` variable is still supported, but the platform-specific values are safer when you run both browser and emulator.
- The app reads the live coffee catalog plus producer and farm routes from FastAPI.
