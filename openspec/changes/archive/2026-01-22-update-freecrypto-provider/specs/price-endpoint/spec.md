## RENAMED Requirements
- FROM: `### Requirement: Bitcoin Price Endpoint`
- TO: `### Requirement: Asset Price Endpoint`

## MODIFIED Requirements
### Requirement: Asset Price Endpoint
The system SHALL expose a single unauthenticated REST endpoint at `/api/price/{symbol}` that returns the latest USD price for the requested asset symbol using FreeCryptoAPI. The `{symbol}` MUST be uppercase alphanumeric without a USD suffix (e.g., `BTC`, `ADA`).

#### Scenario: Fetch asset price by symbol
- **WHEN** a client sends a GET request to `/api/price/BTC`
- **THEN** the response contains `{ "symbol": "BTC", "price": <number> }` sourced from `https://api.freecryptoapi.com/v1/getData?symbol=BTC`

### Requirement: Price Cache
The system SHALL cache each asset price response for a configurable TTL (default 15 minutes).

#### Scenario: Cache hit within TTL
- **WHEN** multiple requests to `/api/price/BTC` occur within the configured TTL
- **THEN** the response is served from cache without calling FreeCryptoAPI again

## ADDED Requirements
### Requirement: Crypto List Endpoint
The system SHALL expose a single unauthenticated REST endpoint at `/api/assets` that proxies FreeCryptoAPI `getCryptoList`.

#### Scenario: Fetch crypto list
- **WHEN** a client sends a GET request to the crypto list endpoint
- **THEN** the response contains the upstream crypto list payload from `https://api.freecryptoapi.com/v1/getCryptoList`

### Requirement: Crypto List Cache
The system SHALL cache the crypto list response for a configurable TTL (default 24 hours).

#### Scenario: Cache hit within TTL
- **WHEN** multiple requests to the crypto list endpoint occur within the configured TTL
- **THEN** the response is served from cache without calling FreeCryptoAPI again
