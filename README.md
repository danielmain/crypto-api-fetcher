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

## Nix

### Quick Run

You can run the service directly without installing it globally:

```bash
# 1. Create a local .env file
cp .env.example .env
# 2. Populate .env with your API keys
nano .env 
# 3. Run directly
nix run
```

### NixOS Service Installation

This project exposes a NixOS module for easy deployment.

1. **Add to your `flake.nix` inputs:**

   ```nix
   inputs.crypto-api-fetcher.url = "github:yourusername/crypto-api-fetcher"; # Replace with actual URL
   ```

2. **Import the module in your configuration:**

   ```nix
   {
     # ...
     imports = [
       inputs.crypto-api-fetcher.nixosModules.default
     ];

     # Enable the service
     services.crypto-api-fetcher = {
       enable = true;
       port = 3000;
       environmentFile = "/path/to/your/secure/env/file.env"; 
     };
   }
   ```

   **Configuration:**
   The `environmentFile` must contain the required environment variables:
   ```bash
   FREECRYPTO_API_KEY=your_api_key
   FREECRYPTO_BASE_URL=https://api.freecryptoapi.com/v1
   PRICE_CACHE_TTL_MINUTES=15
   CRYPTO_LIST_CACHE_TTL_MINUTES=1440
   ```
