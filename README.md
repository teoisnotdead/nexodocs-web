# NexoDocs Web

Frontend del MVP de NexoDocs, una plataforma para gestionar clientes, procesos y solicitudes documentales desde un dashboard operativo.

Este repositorio contiene solo la aplicacion web. La API vive en el repositorio `nexodocs-api`.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Base UI
- React Hook Form
- Zod
- pnpm

## Funcionalidades principales

- Registro e inicio de sesion.
- Dashboard con resumen operativo.
- Gestion de clientes y contactos.
- Gestion de procesos/workspaces.
- Plantillas y checklists documentales.
- Solicitudes documentales.
- Flujo mock de documentos.
- Revisiones, observaciones y entregas.
- Vista de plan actual, limites y uso.

## Requisitos

- Node.js 22 o superior.
- pnpm 11.
- API de NexoDocs corriendo localmente o desplegada.

## Variables de entorno

Copia el ejemplo:

```bash
cp .env.example .env
```

Variables:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
API_INTERNAL_URL=http://127.0.0.1:3001
```

Notas:

- `NEXT_PUBLIC_API_URL` queda expuesta al navegador.
- `API_INTERNAL_URL` es server-only y se usa desde route handlers/server components.
- El navegador llama a `/api/backend`; Next.js proxya esas peticiones hacia la API.

## Desarrollo local

Instalar dependencias:

```bash
pnpm install
```

Levantar la web:

```bash
pnpm dev
```

Abrir:

```text
http://localhost:3000
```

## Scripts

```bash
pnpm dev      # servidor de desarrollo
pnpm build    # build de produccion
pnpm start    # servir build de produccion
pnpm lint     # lint
```

## Deploy en Vercel

Configuracion recomendada:

- Framework: Next.js
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output: automatico de Next.js
- Node.js: 22 o superior

Variables en Vercel:

```bash
NEXT_PUBLIC_API_URL=https://your-nexodocs-api.onrender.com
API_INTERNAL_URL=https://your-nexodocs-api.onrender.com
```

Despues de desplegar la API, agrega la URL final de Vercel en `WEB_ORIGIN` o `WEB_ORIGINS` dentro del backend.

## Relacion con la API

Este frontend espera que la API exponga endpoints REST como:

- `/auth/register`
- `/auth/login`
- `/me`
- `/clients`
- `/workspaces`
- `/document-requests`
- `/documents`
- `/deliveries`
- `/plans/current`

La sesion se maneja con cookies HTTP-only generadas por la API y reenviadas por el proxy interno `/api/backend`.

## Estado del MVP

El almacenamiento de documentos todavia es mock: se guarda metadata en base de datos, pero no binarios en storage real. La integracion futura recomendada es Supabase Storage o S3 compatible.
