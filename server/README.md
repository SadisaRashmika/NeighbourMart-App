# NeighbourMart server

Express and MongoDB API skeleton for the NeighbourMart Expo client.

## Setup

```powershell
npm install
copy .env.example .env
npm run dev
```

Set `MONGO_URI` in `.env`. The API uses `http://localhost:5000` by default.

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
