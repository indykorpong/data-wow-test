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