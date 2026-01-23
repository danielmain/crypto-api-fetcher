## RENAMED Requirements
- FROM: `### Requirement: Alpaca Client Initialization`
- TO: `### Requirement: FreeCryptoAPI Client Initialization`

## MODIFIED Requirements
### Requirement: FreeCryptoAPI Client Initialization
The system SHALL expose a FreeCryptoAPI client initialization module that reads `FREECRYPTO_API_KEY` from the environment and defaults the base URL to `https://api.freecryptoapi.com/v1`.

#### Scenario: Client creation
- **WHEN** the FreeCryptoAPI client module is imported
- **THEN** it reads `FREECRYPTO_API_KEY` and applies the default base URL when `FREECRYPTO_BASE_URL` is not set

## ADDED Requirements
### Requirement: Cache TTL Configuration
The system SHALL read cache TTL values for the price endpoint and crypto list endpoint from environment variables expressed in minutes: `PRICE_CACHE_TTL_MINUTES` (default 15) and `CRYPTO_LIST_CACHE_TTL_MINUTES` (default 1440).

#### Scenario: Cache TTL loading
- **WHEN** the service starts with no cache TTL variables set
- **THEN** it uses the default price cache TTL (15 minutes) and crypto list cache TTL (24 hours)
