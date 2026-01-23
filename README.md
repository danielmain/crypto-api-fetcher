# crypto-api-fetcher

Minimal service that fetches the latest crypto prices from FreeCryptoAPI and serves them via cached REST endpoints.

## Setup

```bash
npm install
cp .env.example .env
```

Populate `.env` with your FreeCryptoAPI key and cache settings.

## Run

```bash
npm run dev
```

The server listens on `PORT` (default `3000`) and exposes:

- `GET /api/price/BTC` -> latest BTC price (cached for `PRICE_CACHE_TTL_MINUTES`)
- `GET /api/assets` -> crypto list (cached for `CRYPTO_LIST_CACHE_TTL_MINUTES`)

Symbols must be uppercase alphanumeric (e.g., `BTC`, `ADA`).

## API Documentation

See `openapi.yaml` for full REST endpoint details, status codes, and examples.

## Build

```bash
npm run build
npm start
```
