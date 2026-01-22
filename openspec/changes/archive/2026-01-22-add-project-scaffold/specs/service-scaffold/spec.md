## ADDED Requirements
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

### Requirement: Alpaca Client Initialization
The system SHALL expose an Alpaca client initialization module that reads API credentials from environment variables.

#### Scenario: Client creation
- **WHEN** the Alpaca client module is imported
- **THEN** it reads `ALPACA_API_KEY` and `ALPACA_API_SECRET` from the environment
