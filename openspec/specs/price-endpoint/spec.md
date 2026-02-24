# price-endpoint Specification

## Purpose
TBD - created by archiving change add-project-scaffold. Update Purpose after archive.
## Requirements
### Requirement: Price Cache
The system SHALL cache each asset price response for a configurable TTL (default 15 minutes).

#### Scenario: Cache hit within TTL
- **WHEN** multiple requests to `/api/price/bitcoin` occur within the configured TTL
- **THEN** the response is served from cache without calling CoinGecko again

### Requirement: Asset Price Endpoint
The system SHALL expose a single unauthenticated REST endpoint at `/api/price/{id}` that returns the latest USD price for the requested asset id using CoinGecko. The `{id}` MUST be a lowercase CoinGecko id (e.g., `bitcoin`, `ethereum`).

#### Scenario: Fetch asset price by symbol
- **WHEN** a client sends a GET request to `/api/price/bitcoin`
- **THEN** the response contains `{ "id": "bitcoin", "price": <number> }` sourced from `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=bitcoin`

### Requirement: Crypto List Endpoint
The system SHALL expose a single unauthenticated REST endpoint at `/api/assets` that proxies CoinGecko `/coins/list`.

#### Scenario: Fetch crypto list
- **WHEN** a client sends a GET request to the crypto list endpoint
- **THEN** the response contains the upstream crypto list payload from `https://api.coingecko.com/api/v3/coins/list`

### Requirement: Crypto List Cache
The system SHALL cache the crypto list response for a configurable TTL (default 24 hours).

#### Scenario: Cache hit within TTL
- **WHEN** multiple requests to the crypto list endpoint occur within the configured TTL
- **THEN** the response is served from cache without calling CoinGecko again
