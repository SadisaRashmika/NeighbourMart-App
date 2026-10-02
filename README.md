# NeighbourMart-App
Local Grocery Pre-order and Pickup App (NeighbourMart) for SLIIT ITPM/HCI project.

## Projects

- `client/` - Expo React Native mobile application
- `backend/` - Express, TypeScript, and MongoDB API

## Backend setup

```powershell
cd backend
npm install
copy .env.example .env
npm run dev
```

Set `MONGODB_URI` in `backend/.env` to connect MongoDB. The backend health endpoint is available at `http://localhost:4000/api/health`.
