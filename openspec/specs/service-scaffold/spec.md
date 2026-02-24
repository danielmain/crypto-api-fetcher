# service-scaffold Specification

## Purpose
TBD - created by archiving change add-project-scaffold. Update Purpose after archive.
## Requirements
### Requirement: Project Scaffold
The system SHALL provide a baseline project scaffold including a Nix flake, npm metadata, and a `src/` directory suitable for TypeScript development.

#### Scenario: Repository setup
- **WHEN** a developer clones the repository
- **THEN** a Nix dev shell can be entered and a TypeScript project structure is present

### Requirement: Environment Configuration
The system SHALL provide a tracked `.env.example` and exclude `.env` from version control.

#### Scenario: Public repository safety
- **WHEN** a developer configures local credentials
- **THEN** `.env` is ignored by git and `.env.example` documents required variables

### Requirement: CoinGecko Client Initialization
The system SHALL expose a CoinGecko client initialization module that reads `COINGECKO_API_KEY` from the environment and defaults the base URL to `https://api.coingecko.com/api/v3`.

#### Scenario: Client creation
- **WHEN** the CoinGecko client module is imported
- **THEN** it reads `COINGECKO_API_KEY` and applies the default base URL when `COINGECKO_BASE_URL` is not set

### Requirement: Cache TTL Configuration
The system SHALL read cache TTL values for the price endpoint and crypto list endpoint from environment variables expressed in minutes: `PRICE_CACHE_TTL_MINUTES` (default 15) and `CRYPTO_LIST_CACHE_TTL_MINUTES` (default 1440).

#### Scenario: Cache TTL loading
- **WHEN** the service starts with no cache TTL variables set
- **THEN** it uses the default price cache TTL (15 minutes) and crypto list cache TTL (24 hours)
