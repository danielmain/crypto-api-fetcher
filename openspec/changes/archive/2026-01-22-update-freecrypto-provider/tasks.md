## 1. Implementation
- [x] 1.1 Replace the current price client module with a FreeCryptoAPI client (new endpoint, auth header, error handling).
- [x] 1.2 Update environment loading/types to use `FREECRYPTO_API_KEY` (and optional `FREECRYPTO_BASE_URL`) plus cache TTL env vars, and update `.env`/`.env.example` to remove legacy provider variables.
- [x] 1.3 Update symbol parsing and HTTP route validation to accept asset symbols without `-USD`.
- [x] 1.4 Add a crypto list endpoint backed by `getCryptoList` with 24-hour caching.
- [x] 1.5 Update cache wiring and imports to use the FreeCryptoAPI client.
- [x] 1.6 Update tests (unit, cache, and live integration) to the new symbol format and provider response shape.
- [x] 1.7 Update README and any docs referencing the previous provider or the old endpoint format.
- [x] 1.8 Run the test suite and fix any regressions.
