# data-wow-test

## Running with Docker

Requires Docker and Docker Compose.

1. Create env files from the templates (`docker compose` needs real files, not just templates):
   ```
   cp .env.template .env
   cp apps/api/.env.template apps/api/.env
   cp apps/web/.env.template apps/web/.env
   ```
2. Build and start everything:
   ```
   docker compose up --build
   ```
   This starts Postgres, the NestJS API, and the Next.js web app. The API applies pending Prisma migrations automatically on startup.
3. Once it's up:
   - Web app: http://localhost:3001
   - API: http://localhost:3000
4. Seed the admin user (first run only):
   ```
   docker compose exec api npx prisma db seed
   ```

## Architecture

pnpm workspace monorepo with two apps under `apps/` (no shared packages, no Turborepo/Nx — task orchestration is plain `pnpm --filter`):

- **`apps/api`** — NestJS 11 backend, Prisma 6 ORM against PostgreSQL. JWT auth (`@nestjs/jwt` + Passport), applied globally via `JwtAuthGuard` + `RolesGuard` (routes opt out with `@Public()`, restrict with `@Roles()`). Domains:
  - `auth` — login/register/JWT issuance, `/auth/me`
  - `users` — user lookup/creation used by auth
  - `concerts` — concert CRUD
  - `reservations` — reserve/cancel a seat, reservation history
  - `admin` — admin-only stats and ping, gated by `@Roles(Role.ADMIN)`
  - `prisma` — global `PrismaService` wrapping `PrismaClient`

  Data model (`apps/api/prisma/schema.prisma`): `User` (ADMIN/USER role), `Concert`, `Reservation` (unique per user+concert), `ReservationLog` (audit trail of RESERVE/CANCEL actions).

- **`apps/web`** — Next.js 16 frontend (App Router), React 19, Tailwind CSS 4. Route groups: `(auth)` for login/signup, `(app)` for authenticated admin/user views and history pages. State is plain React Context (`AuthContext`, `ConcertsContext`, `ToastContext`) — no Redux/Zustand. API access goes through a hand-rolled `fetch` wrapper (`src/lib/api.ts`), not axios/react-query.

- **Services** (`docker-compose.yml`): `postgres` (16-alpine) ← `api` (port 3000) ← `web` (port 3001, calls the API via `NEXT_PUBLIC_API_URL`). The API applies Prisma migrations on container startup.

## Libraries

**apps/api**
- Framework: NestJS (`@nestjs/common`, `core`, `platform-express`, `config`)
- Auth: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`
- ORM/DB: `@prisma/client`, `prisma`
- Validation: `class-validator`, `class-transformer`
- Testing: `jest`, `ts-jest`, `@nestjs/testing`, `supertest`
- Lint/format: `eslint` (flat config), `prettier`

**apps/web**
- Framework: `next` 16, `react`/`react-dom` 19
- Styling: `tailwindcss` 4
- Testing: `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- Lint: `eslint`, `eslint-config-next`

**Root**
- `concurrently` (runs web + api dev servers together), pinned package manager `pnpm@10.24.0`

## Running Tests

No monorepo task runner — run per app with `pnpm --filter <app> <script>` from the repo root (or `cd apps/<app>` and run directly).

**API (`apps/api`)**
```
pnpm --filter api test        # unit tests (Prisma is mocked — no DB needed)
pnpm --filter api test:watch
pnpm --filter api test:cov
pnpm --filter api test:e2e    # boots the full AppModule — needs Postgres reachable via DATABASE_URL
```
For `test:e2e`, start Postgres first, e.g. `docker compose up postgres -d`.

**Web (`apps/web`)**
```
pnpm --filter web test        # component/context tests via jsdom — standalone, no backend needed
pnpm --filter web test:watch
```

Only `api test:e2e` requires the database; all other test commands run standalone.