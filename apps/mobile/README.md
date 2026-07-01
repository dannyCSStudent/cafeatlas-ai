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

- Use `http://10.0.2.2:8000` for Android emulators if `localhost` cannot reach the backend.
- The app reads the live coffee catalog plus producer and farm routes from FastAPI.
