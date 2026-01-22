## ADDED Requirements
### Requirement: Bitcoin Price Endpoint
The system SHALL expose a single unauthenticated REST endpoint at `/api/test` that returns the latest Bitcoin price.

#### Scenario: Fetch BTC price
- **WHEN** a client sends a GET request to `/api/test`
- **THEN** the response contains the latest Bitcoin price as fetched from Alpaca market data (`https://data.alpaca.markets`)

### Requirement: Price Cache
The system SHALL cache the Bitcoin price response for 15 minutes.

#### Scenario: Cache hit within TTL
- **WHEN** multiple requests to `/api/test` occur within 15 minutes
- **THEN** the response is served from cache without calling Alpaca again
