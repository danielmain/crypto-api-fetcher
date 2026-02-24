# Change: Add Client-Facing API Documentation Endpoint

## Why
API clients need a stable, self-serve documentation surface they can use to integrate without reading source code.

## What Changes
- Add an API documentation endpoint served by the service (Swagger UI).
- Expose the OpenAPI document from the running service as JSON.
- Keep `openapi.yaml` as the source spec and convert it to served JSON at build time.

## Impact
- Affected specs: `service-scaffold`
- Affected code: `src/server.ts`, build scripts, docs assets, tests, `README.md`
