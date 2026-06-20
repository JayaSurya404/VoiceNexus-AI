# ADR 0001: Phase 1 persistence uses MongoDB Atlas behind repository ports

Date: 2026-06-20

## Status

Accepted

## Context

VoiceNexus AI Phase 1 needs the complete SaaS foundation: users, organizations,
organization membership, JWT authentication, refresh sessions, and role-aware APIs.
The approved implementation direction is MongoDB Atlas with Mongoose for Phase 1,
while keeping the repository and service layer compatible with a future database
migration if needed.

## Decision

Phase 1 stores operational SaaS records in MongoDB Atlas:

- `users`
- `organizations`
- `organizationmembers`
- `refreshsessions`

Application services depend on TypeScript repository ports, not on Mongoose models.
The current MongoDB implementation lives under the infrastructure layer. Business
logic lives under the application layer and only talks to repository interfaces.

## Consequences

This keeps Phase 1 fast to build and easy to operate with Atlas while preserving a
clean migration path. A future PostgreSQL, DynamoDB, or hybrid persistence layer can
be introduced by implementing the same repository contracts and moving data through
a controlled migration.

MongoDB-specific concerns remain isolated to infrastructure:

- Mongoose schemas and indexes
- Atlas connection lifecycle
- MongoDB transactions
- TTL cleanup for refresh sessions
- ObjectId mapping

## Migration guardrails

- Do not import Mongoose models inside application services or controllers.
- Keep domain entities plain TypeScript objects.
- Keep API request/response contracts in `packages/contracts`.
- Add new database operations to repository ports before implementing them in Mongo.
- Keep multi-tenant filtering explicit in application services.
