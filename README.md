# VoiceNexus AI

VoiceNexus AI is a startup-grade AI calling and customer communication platform.
Phase 1 implements the SaaS foundation: authentication, organizations, membership
roles, MongoDB Atlas persistence, and a Next.js dashboard shell.

## Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, shadcn-style UI components
- Backend: Node.js, Express, TypeScript
- Database: MongoDB Atlas with Mongoose
- Auth: JWT access token, rotating refresh token, bcrypt
- State: Zustand and TanStack Query
- Monorepo: pnpm workspaces and Turborepo

## Monorepo structure

```txt
apps/
  api/       Express API service
  web/       Next.js dashboard and marketing app
services/
  realtime-gateway/ Twilio Media Streams WebSocket and live-call supervisor gateway
packages/
  contracts/ Shared API contracts, DTOs, roles, and validation schemas
docs/
  adr/       Architecture decision records
  architecture/
tools/       Workspace maintenance scripts
```

## Phase 1 services

- API service: auth, organization, membership, refresh-session management
- Web app: landing page, login, register, protected dashboard, organization switcher
- Contracts package: shared validation schemas and response DTOs

## Database collections

- `users`
- `organizations`
- `organizationmembers`
- `refreshsessions`

The backend uses repository interfaces around MongoDB. That keeps the service layer
compatible with a future persistence migration.

## API routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /organizations`
- `POST /organizations`
- `GET /organizations/:id`
- `GET /health`

## Roles

- Super Admin: platform-level access
- Owner: full organization access
- Manager: organization operations and team visibility
- Agent: conversation handling and organization read access

## Local setup

Install dependencies:

```bash
pnpm install
```

Create environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp services/realtime-gateway/.env.example services/realtime-gateway/.env
```

Set a real MongoDB Atlas connection string in `apps/api/.env` and replace both JWT
secrets with strong random values of at least 32 characters.
Use the same JWT access secret in `services/realtime-gateway/.env`, and set Redis
plus `MEDIA_STREAM_SECRET` for realtime Media Stream session validation.

Start development:

```bash
pnpm dev
```

Run individual apps:

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:realtime
```

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

## Development phases

1. SaaS foundation: auth, organizations, roles, dashboard shell, MongoDB Atlas
2. Customer and lead data model, memory layer, timeline events
3. Twilio voice integration, inbound/outbound webhooks, call records
4. AI call orchestration workers, prompts, transcripts, scoring
5. WhatsApp sender onboarding, templates, inbound/outbound messaging
6. Follow-up automation, human handoff, agent inbox
7. Billing, usage limits, audit logs, observability, deployment hardening
