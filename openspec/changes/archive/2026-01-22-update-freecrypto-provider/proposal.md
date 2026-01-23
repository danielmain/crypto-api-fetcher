# Change: Switch price provider to FreeCryptoAPI

## Why
The previous provider does not support ADA-USD, which blocks fetching ADA prices. FreeCryptoAPI supports the required assets and defaults to USD pricing without requiring a pair.

## What Changes
- Replace the current price client with a FreeCryptoAPI client and remove legacy provider-specific code and references.
- Add a `FREECRYPTO_API_KEY` environment variable (and optional base URL) while removing legacy provider environment variables.
- Accept asset symbols without the `-USD` suffix (e.g., `BTC`, `ADA`) and treat USD as implicit.
- Add an endpoint that proxies `getCryptoList`, cached for 24 hours.
- Configure cache TTLs via environment variables for both price and crypto list endpoints.
- Update cache wiring, tests, and documentation to match the new provider and symbol format.

## Impact
- Affected specs: `price-endpoint`, `service-scaffold`
- Affected code: `src/freecrypto.ts`, `src/env.ts`, `src/domain/price.ts`, `src/price-cache.ts`, `src/server.ts`, tests, `.env.example`, `README.md`
