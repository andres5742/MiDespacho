# Reto Técnico — MiDespacho (Fullstack)

Módulo demo de **expediente jurídico** enfocado en:

- **Carga múltiple de archivos** en una sola acción (un “lote”).
- Cada lote incluye **título** y **descripción**.
- **Listado** de archivos agrupados por lote (sin visor; incluye descarga).

## Stack

- **Frontend**: Angular **v21** + **SSR** + TailwindCSS (`apps/web`)
- **Backend**: NestJS + TypeORM (`apps/api`)
- **DB**: PostgreSQL

## Estructura

- `apps/api`: API REST (`/api/...`)
- `apps/web`: Web SSR
- `storage/`: archivos subidos (se crea automáticamente)

## Despliegue

- **Frontend (Angular)**: ver [Vercel](https://vercel.com) — importar repo con **Root Directory** `apps/web`.
- **Backend (API + PostgreSQL)**: ver **[README-RENDER.md](./README-RENDER.md)** para desplegar en [Render](https://render.com).

## Requisitos (desarrollo local)

- Node.js (probado con Node 24)
- PostgreSQL (local o Docker)

## Levantar PostgreSQL (opcional con Docker)

Si tienes Docker instalado:

```bash
docker compose up -d
```

Esto crea una DB con:
- user: `postgres`
- password: `postgres`
- db: `midespacho`
- port: `5432`

## Backend (NestJS)

```bash
cd apps/api
copy .env.example .env
npm install
npm run start:dev
```

API en `http://localhost:3000/api`.

Endpoints principales:
- `GET /api/expedientes`
- `GET /api/expedientes/:id`
- `GET /api/expedientes/:id/lotes`
- `POST /api/expedientes/:id/lotes` (multipart: `titulo`, `descripcion`, `files[]`)
- `GET /api/archivos/:id/download`

## Frontend (Angular SSR)

El frontend está configurado con **Server-Side Rendering (SSR)**:
- Ruta `/expedientes`: prerenderizada estática.
- Rutas `/expedientes/:id` y resto: render en servidor (SSR).

**Desarrollo** (con SSR en dev):

```bash
cd apps/web
npm install
npm run start
```

Web en `http://localhost:4200`.

**Producción (servir build con SSR)**:

```bash
cd apps/web
npm run build
npm run serve:ssr:web
```

Sirve la app en el puerto por defecto del servidor Node (revisa la salida en consola).

> El frontend usa por defecto `http://localhost:3000/api` como base (token `API_BASE_URL`).

## Arranque rápido (2 terminales)

- Terminal 1: API (`apps/api`)
- Terminal 2: Web (`apps/web`)

O desde la raíz:

```bash
npm run install:all
```

Luego:

```bash
npm run dev
```

