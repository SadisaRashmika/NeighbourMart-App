# NeighbourMart client

Expo React Native skeleton for the NeighbourMart customer and shop-owner interfaces.

## Run with Expo Go

```powershell
npm install
copy .env.example .env
npm start
```

Scan the QR code with Expo Go. A physical device cannot reach the development computer through `localhost`; set `EXPO_PUBLIC_API_URL` in `.env` to the computer's LAN address.

## Routes

- `/(auth)` - login and account creation
- `/customer` - customer dashboard, cart, orders, settings, product, substitution, pickup, and tracking
- `/shop` - shop dashboard, stock, orders, settings, product form, order details, and reports

Route files should remain small. Put reusable UI in `src/components`, shared state in `src/context`, and feature API/hooks/types in `src/features`.

## Check the client

```powershell
npm run typecheck
npm run lint
```
