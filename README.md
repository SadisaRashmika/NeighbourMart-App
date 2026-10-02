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

The client is compatible with Expo Go. When testing on a physical phone, replace `localhost` in `client/.env` with the computer's LAN IP address, for example:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:5000
```

## Server setup

```powershell
cd server
npm install
copy .env.example .env
npm run dev
```

Set `MONGO_URI` in `server/.env`. The server defaults to port `5000`, and its health endpoint is `GET http://localhost:5000/api/health`.

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
