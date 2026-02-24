## ADDED Requirements
### Requirement: API Documentation Endpoint
The system SHALL expose client-facing API documentation using Swagger UI and the current OpenAPI specification.

#### Scenario: Render interactive docs
- **WHEN** a client sends `GET /api/docs`
- **THEN** the response is an HTML page rendering Swagger UI
- **AND** the UI loads its schema from `/api/openapi.json`

#### Scenario: Serve OpenAPI schema as JSON
- **WHEN** a client sends `GET /api/openapi.json`
- **THEN** the response is status `200` with `application/json`
- **AND** it contains the current OpenAPI document used by the service
