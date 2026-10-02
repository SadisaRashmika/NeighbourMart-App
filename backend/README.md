# NeighbourMart backend

Express and MongoDB API for the NeighbourMart Expo client.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

Set `MONGO_URI` in `.env` to your MongoDB Atlas connection string. The API runs on `http://localhost:5000` by default.

Check the service with `GET /api/health`.
