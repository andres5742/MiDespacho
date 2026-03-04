# Desplegar en Render (API + PostgreSQL)

Pasos para dejar la **API NestJS** y **PostgreSQL** en [Render](https://render.com) (el frontend lo puedes desplegar en Vercel).

---

## 1. Subir el repo a GitHub

Si aún no lo has hecho:

```bash
git init
git add .
git commit -m "Reto MiDespacho"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

## 2. Crear la base de datos en Render

1. Entra en [dashboard.render.com](https://dashboard.render.com).
2. **New +** → **PostgreSQL**.
3. **Name**: `midespacho-db` (o el que quieras).
4. **Region**: elige la más cercana.
5. **Plan**: Free.
6. **Create Database**.
7. Cuando esté en **Available**, entra al servicio y en **Connections** copia:
   - **Internal Database URL** (la usarás en la API).

---

## 3. Crear el Web Service (API)

1. **New +** → **Web Service**.
2. Conecta tu cuenta de **GitHub** y elige el repositorio del reto.
3. Configuración:
   - **Name**: `midespacho-api` (o el que quieras).
   - **Region**: la misma que la base de datos.
   - **Branch**: `main`.
   - **Root Directory**: `apps/api`.
   - **Runtime**: `Node`.
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
4. **Environment** (variables de entorno):
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = pega la **Internal Database URL** del paso 2 (desde **Connections** del Postgres en Render).
   - `TYPEORM_SYNC` = `true` (para que cree tablas; en producción real usarías migraciones).
   - `PORT` = Render lo asigna solo; no hace falta ponerlo.
   - (Opcional) Si tu frontend está en otro dominio, añade `CORS_ORIGIN` = `https://tu-app.vercel.app`
5. **Create Web Service**.

Render hará el primer deploy. Cuando termine, la API quedará en una URL tipo:

`https://midespacho-api.onrender.com`

---

## 4. Probar la API

- Listado de expedientes:  
  `GET https://tu-api.onrender.com/api/expedientes`
- Health (si tienes ruta):  
  `GET https://tu-api.onrender.com/api`

---

## 5. Conectar el frontend (Vercel)

En el proyecto del frontend en **Vercel** → **Settings** → **Environment Variables** añade:

- `API_BASE_URL` = `https://tu-api.onrender.com/api`  
  (o la URL que te haya dado Render)

Y en el código del frontend asegúrate de usar esa variable para las llamadas a la API (por ejemplo el token `API_BASE_URL` que ya tienes).

---

## Notas

- **Plan Free**: el servicio se “duerme” tras inactividad; la primera petición puede tardar unos segundos.
- **Archivos subidos**: en Render el disco es efímero. Los archivos que suban los usuarios se pierden al redeploy. Para producción habría que usar un storage externo (S3, etc.).
- La API ya acepta `DATABASE_URL`; no hace falta configurar `DB_HOST`, `DB_USER`, etc. por separado cuando usas Render.
