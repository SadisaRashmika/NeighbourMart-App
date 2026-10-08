# NeighbourMart server

Express and MongoDB API for the NeighbourMart Expo client.

The service is deployable as a Docker web service. `render.yaml` configures a permanent public HTTPS deployment on Render.

## Setup

```powershell
npm install
copy .env.example .env
npm run dev
```

Set `MONGO_URI`, `JWT_SECRET`, `MAIL_USER`, `MAIL_PASSWORD`, and `MAIL_FROM` in `.env`. The API uses `http://localhost:5000` by default.

## Permanent deployment

1. Push the repository to GitHub.
2. In Render, choose **New +** → **Blueprint** and select this repository.
3. Render reads `render.yaml` and creates `neighbourmart-api`.
4. Add the secret environment values when Render asks for them.
5. Copy the generated HTTPS URL into the client `.env` as `EXPO_PUBLIC_API_URL`.

## Available routes

- `GET /api/health` - working health and database-status response
- `/api/auth` - authentication skeleton
- `/api/users` - user skeleton
- `/api/shops` - shop skeleton
- `/api/products` - product and stock skeleton
- `/api/orders` - customer and shop order skeleton
- `/api/reports` - shop reporting skeleton

Feature endpoints return HTTP 501 until their implementations are added.

## Check the server

```powershell
npm run typecheck
npm run build
```
