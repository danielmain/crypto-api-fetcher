# crypto-api-fetcher

Minimal service that fetches the latest crypto prices from CoinGecko and serves them via cached REST endpoints.

## Setup

```bash
npm install
cp .env.example .env
```

Populate `.env` with your CoinGecko API key and cache settings.

## Run

```bash
npm run dev
```

The server listens on `PORT` (default `3000`) and exposes:

- `GET /api/price/bitcoin` -> latest Bitcoin USD price (cached for `PRICE_CACHE_TTL_MINUTES`)
- `GET /api/assets` -> crypto list (cached for `CRYPTO_LIST_CACHE_TTL_MINUTES`)

Asset IDs must be lowercase CoinGecko IDs (e.g., `bitcoin`, `ethereum`, `cardano`).

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
    COINGECKO_API_KEY=your_api_key
    COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
    PRICE_CACHE_TTL_MINUTES=15
    CRYPTO_LIST_CACHE_TTL_MINUTES=1440
    ```

### Deployment Commands

After making changes to the code, use these commands to deploy updates to your NixOS system:

**Update and deploy all flake inputs:**
```bash
cd /etc/nixos && sudo nix flake update && sudo nixos-rebuild switch --flake /etc/nixos#hetzner-x86_64
```

**Update only crypto-api-fetcher and deploy:**
```bash
cd /etc/nixos && sudo nix flake update --update-input crypto-api-fetcher && sudo nixos-rebuild switch --flake /etc/nixos#hetzner-x86_64
```

**Complete workflow after code changes:**
```bash
# 1. Commit your changes
cd /home/daniel/crypto-api-fetcher
git add .
git commit -m "Description of changes"

# 2. Update NixOS with the latest version
cd /etc/nixos
sudo nix flake update --update-input crypto-api-fetcher
sudo nixos-rebuild switch --flake /etc/nixos#hetzner-x86_64

# 3. Verify the service is running
sudo systemctl status crypto-api-fetcher
```

**Check service logs:**
```bash
sudo journalctl -u crypto-api-fetcher -f
```
