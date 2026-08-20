# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project structure

pnpm monorepo (`pnpm@10.24.0`, workspaces = `apps/*`, no shared packages):
- `apps/api` — NestJS 11 + Prisma 6 + PostgreSQL. Domains: `auth`, `users`, `concerts`, `reservations`, `admin`, `prisma` (global `PrismaService`). Global `JwtAuthGuard` + `RolesGuard` — opt out with `@Public()`, restrict with `@Roles()`.
- `apps/web` — Next.js 16 (App Router) + React 19 + Tailwind 4. Route groups: `(auth)`, `(app)`. State via plain React Context (no Redux/Zustand). API calls go through `src/lib/api.ts` (hand-rolled fetch wrapper, not axios/react-query).

There is no root-level test/lint/build script beyond `dev`, `dev:web`, `dev:api`, and `build` (which runs `pnpm --filter web build && pnpm --filter api build`). Always invoke other commands per-app: `pnpm --filter api <script>` / `pnpm --filter web <script>`, or `cd` into the app first.

## Commands

**API** (`apps/api`):
- `pnpm --filter api start:dev` — dev server with watch
- `pnpm --filter api lint` — ESLint with `--fix`
- `pnpm --filter api format` — Prettier write on `src/`, `test/`
- `pnpm --filter api test` — Jest unit tests (Prisma mocked, no DB needed)
- `pnpm --filter api test:e2e` — Jest e2e tests; boots full `AppModule`, **requires Postgres reachable via `DATABASE_URL`** (`docker compose up postgres -d` first)
- `pnpm --filter api prisma:migrate` — apply Prisma migrations locally (not automatic outside Docker)
- `pnpm --filter api prisma:seed` — seed admin user

**Web** (`apps/web`):
- `pnpm --filter web dev` — dev server on port **5173** (not 3000)
- `pnpm --filter web lint`
- `pnpm --filter web test` — Jest + Testing Library, jsdom, standalone (no backend needed)

## Environment & ports

- API: port 3000. Web local dev: port **5173**. Web via Docker: exposed on host **3001** (container port 3000). Postgres: 5432.
- `apps/api/.env` `ALLOWED_ORIGINS` defaults to `http://localhost:5173` (matches local `next dev`), but `docker-compose.yml` overrides it to `http://localhost:3001` for the containerized web app — check which one applies when debugging CORS.
- Docker Compose needs real `.env` files, not just templates: copy all three templates (root, `apps/api/.env.template`, `apps/web/.env.template`) to `.env` before `docker compose up --build`.
- API auto-applies Prisma migrations on container startup; this does **not** happen for local `pnpm dev:api` — run `pnpm --filter api prisma:migrate` manually.
- First run (Docker) needs manual admin seed: `docker compose exec api npx prisma db seed`.

## Code style

- `apps/api` TypeScript is **not** in full strict mode (`noImplicitAny: false`, `strictBindCallApply: false`); `apps/web` TypeScript **is** full `strict: true`. Match the strictness of whichever app you're editing.
- API Prettier config: single quotes, trailing commas (`apps/api/.prettierrc`).
- API ESLint intentionally allows `any` (`@typescript-eslint/no-explicit-any: 'off'`) and treats floating promises / unsafe-argument as warnings, not errors.

## Commit style

Use Conventional Commits (`feat:`, `fix:`, `chore:`, `test:`, etc.), matching existing git history.
