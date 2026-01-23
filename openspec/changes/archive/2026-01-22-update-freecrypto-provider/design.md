## Context
The service currently fetches prices from a provider using symbol pairs like `BTC-USD` and caches results for 15 minutes. That provider does not support ADA-USD, so the backend must change. FreeCryptoAPI returns USD prices by default for a single asset symbol and requires an API key.

## Goals / Non-Goals
- Goals:
  - Fetch prices from FreeCryptoAPI using a single asset symbol (USD implicit).
  - Remove legacy provider-specific code, configuration, and references.
  - Expose a cached crypto list endpoint backed by `getCryptoList`.
  - Make cache TTLs configurable via environment variables.
  - Preserve existing cache behavior and response shape.
- Non-Goals:
  - Expand the HTTP response to include change, market cap, or technical indicators.
  - Add per-user API keys or authentication.

## Decisions
- Decision: Use `https://api.freecryptoapi.com/v1/getData?symbol={symbol}` as the upstream endpoint.
  - Rationale: This is the documented FreeCryptoAPI entry point and aligns with USD-default behavior.
- Decision: Add a proxy endpoint for `getCryptoList` and cache the result for 24 hours.
  - Rationale: Aligns with upstream usage patterns and avoids repeated list fetches.
- Decision: Accept only uppercase asset symbols without `-USD` (e.g., `BTC`, `ADA`).
  - Rationale: Keeps the request path concise, aligns with common symbol conventions, and avoids requiring callers to append a USD pair.
- Decision: Keep the HTTP response shape as `{ symbol, price }`.
  - Rationale: Downstream callers only need the price, and this matches existing behavior.
- Decision: Provide `FREECRYPTO_BASE_URL` as an optional override with a default of `https://api.freecryptoapi.com/v1`.
  - Rationale: Maintains configurability without forcing changes for standard usage.
- Decision: Provide environment variables for price cache TTL and crypto list cache TTL, expressed in minutes.
  - Rationale: Enables tuning without code changes while keeping values human-readable.
  - Variables: `PRICE_CACHE_TTL_MINUTES` (default 15), `CRYPTO_LIST_CACHE_TTL_MINUTES` (default 1440).
- Decision: Expose the crypto list at `/api/assets`.
  - Rationale: Keeps the endpoint short and semantically aligned with an asset catalog.

## Risks / Trade-offs
- FreeCryptoAPI response fields differ from the current provider; parsing must be updated carefully to avoid runtime failures.
- Removing legacy configuration may break existing deployments if environment files are not updated.

## Migration Plan
1. Introduce new FreeCryptoAPI client and env vars.
2. Update symbol parsing and HTTP route behavior.
3. Add crypto list endpoint and cache.
4. Update tests and documentation.
5. Remove legacy provider artifacts and ensure `.env` and `.env.example` are updated.

## Open Questions
- None.
