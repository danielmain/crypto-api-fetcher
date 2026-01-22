# Change: Add initial project scaffold and env handling

## Why
Set up a minimal, reproducible baseline so development can start immediately with consistent tooling and a safe approach to Alpaca credentials.

## What Changes
- Add initial repo scaffold (Nix flake, npm package metadata, src layout).
- Define environment variable conventions and a tracked `.env.example`.
- Add an Alpaca client initialization module that reads env vars.
- Add a minimal unauthenticated REST endpoint that returns the Bitcoin price.

## Impact
- Affected specs: service-scaffold, price-endpoint
- Affected code: flake.nix, package.json, src/, .env.example, .gitignore, HTTP server

## Acceptance Criteria
- A running server exposes a single unauthenticated REST endpoint at `/api/test` that returns the latest Bitcoin price.
- The Bitcoin price response is cached for 15 minutes.

## Open Questions
- None.
