# Reto Técnico — MiDespacho

Módulo de expediente jurídico: carga múltiple de archivos por lote (título, descripción), listado por expediente.

**Stack:** Angular 21 + SSR + Tailwind (`apps/web`), NestJS + TypeORM (`apps/api`), PostgreSQL.

## Local

- **API:** `cd apps/api` → `copy .env.example .env` → `npm install` → `npm run start:dev`
- **Web:** `cd apps/web` → `npm install` → `npm run start`

O desde la raíz: `npm run install:all` y `npm run dev`.

## Estructura

- `apps/api` — REST API
- `apps/web` — frontend Angular SSR
- `storage/` — archivos subidos

## API

- `GET /api/expedientes`, `GET /api/expedientes/:id`, `GET /api/expedientes/:id/lotes`
- `POST /api/expedientes/:id/lotes` (multipart: `titulo`, `descripcion`, `files[]`)
- `PATCH /api/expedientes/:id` (body: `{ "estado": "ABIERTO" | "EN_PROCESO" | "CERRADO" }`)
- `GET /api/archivos/:id/download`

## Deploy (Render)

- Root: `apps/api`
- Build: `npm install --include=dev && npm run build`
- Start: `npm run start:prod`
- Env: `NODE_ENV=production`, `DATABASE_URL`, `TYPEORM_SYNC=true`, `CORS_ORIGIN` = URL del front (Vercel) o `*`
