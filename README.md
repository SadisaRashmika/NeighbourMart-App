# NeighbourMart

NeighbourMart is a mobile-first grocery pre-order and pickup application for neighborhood customers and small shop owners.

## Projects

- `client/` - Expo React Native application with customer and shop-owner routes.
- `server/` - Express, TypeScript, Mongoose, and MongoDB API skeleton.

## Client setup

```powershell
cd client
npm install
copy .env.example .env
npm start
```

The client is compatible with Expo Go. For a shared team setup, set `EXPO_PUBLIC_API_URL` to the permanent HTTPS URL of the deployed server:

```env
EXPO_PUBLIC_API_URL=https://your-neighbourmart-api.onrender.com
```

## Server setup

```powershell
cd server
npm install
copy .env.example .env
npm run dev
```

Set `MONGO_URI` in `server/.env`. The server defaults to port `5000`, and its health endpoint is `GET http://localhost:5000/api/health`.

For a permanent public backend, deploy using the root `render.yaml` Blueprint. After deployment, all collaborators use the same Render URL and no longer change IP addresses when switching Wi-Fi.

## Validation

```powershell
cd client
npm run typecheck
npm run lint

cd ../server
npm run typecheck
npm run build
```

Feature endpoints intentionally return HTTP 501 until the assigned team members implement them. The health endpoint is ready to use.
