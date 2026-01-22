# crypto-api-fetcher

Minimal service that fetches the latest BTC price from Alpaca market data and serves it via a cached REST endpoint.

## Setup

```bash
npm install
cp .env.example .env
```

Populate `.env` with your Alpaca API credentials.

## Run

```bash
npm run dev
```

The server listens on `PORT` (default `3000`) and exposes:

- `GET /api/test` -> latest BTC price (cached for 15 minutes)

## Build

```bash
npm run build
npm start
```
