# Deployment Method

## Context
Ecotrack needs automated and environment-specific deployments.

## Decision
Use GitHub Actions with Fly.io; branch-based deployment (e.g. `dev`, `main`).

## Consequences
- Clear separation between staging/prod
- Enables feature branch previews
