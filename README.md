# Property Renting — Fitur 1

Monorepo aplikasi untuk scope Fitur 1:

- `apps/web` untuk frontend (React + Vite + TypeScript)
- `apps/api` untuk backend (Express + Prisma + TypeScript)

## Setup Lokal

1. Install dependency frontend
   - `cd apps/web`
   - `npm install`
2. Install dependency backend
   - `cd ../api`
   - `npm install`
3. Copy env example
   - `apps/web/.env.example` -> `apps/web/.env`
   - `apps/api/.env.example` -> `apps/api/.env`

## Run Dev

- Frontend: `npm run dev` di `apps/web`
- Backend: `npm run dev` di `apps/api`

## Catatan Git

Sebelum push ke GitHub, pastikan file internal tidak ikut track:

- `.windsurf/`
- `docs/`
- `AGENTS.md`
