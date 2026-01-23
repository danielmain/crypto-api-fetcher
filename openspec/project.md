# Project Context

## Purpose
Provide a backend service that fetches crypto prices from FreeCryptoAPI, caches results, and serves them to a separate application via a single shared API key to avoid per-user credentials.

## Tech Stack
- Runtime: Node.js or Bun (pending final choice; see conventions below)
- Language: TypeScript (functional style) with `fp-ts`
- Caching: TanStack Query (server-side cache)
- Dev tooling: Nix flakes for reproducible development
- Deployment: NixOS server with a systemd service for auto-start/restart

## Project Conventions

### Code Style
- Functional programming only: pure functions, explicit effects, no shared mutable state
- Use `fp-ts` types and combinators for all business logic
- Prefer data-first, composable pipelines (`pipe`) and total functions
- I/O and side effects isolated at the boundaries

### Architecture Patterns
- Single service that fetches prices on a 15-minute interval and caches results
- Serve cached prices to downstream app without per-user API keys
- Isolate infrastructure (HTTP server, FreeCryptoAPI client, timers) from pure domain logic

### Testing Strategy
- Unit tests with Vitest for pure functions
- Integration tests for FreeCryptoAPI client and cache behavior
- Require green test suite before merge

### Git Workflow
- Repo: `git@github.com:danielmain/crypto-api-fetcher.git`
- Branching: `main` protected; work on feature branches
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- PRs required for merge; CI must pass

### Tooling
- Formatter: Prettier
- Linter: ESLint with `fp-ts`-friendly rules

## Domain Context
- Price cache defaults to 15 minutes; crypto list cache defaults to 24 hours (both configurable via env)
- Service must avoid creating per-user API keys; use a single shared key

## Important Constraints
- Cache validity: default 15 minutes for price data; configurable via env
- Must run on NixOS with a systemd service for automatic start/restart
- Strict functional programming principles using `fp-ts`

## External Dependencies
- FreeCryptoAPI for crypto price data
