# Property Renting — StayEase

Monorepo aplikasi sewa properti (Fitur 1: Landing Page, Auth, Property Management).

## Tech Stack

- **Frontend** (`apps/web`): React 18 + Vite + TypeScript + TailwindCSS
- **Backend** (`apps/api`): Express 5 + Prisma + TypeScript + PostgreSQL (Neon)
- **Storage**: Cloudinary (gambar)
- **Email**: Mailtrap / Gmail SMTP
- **Auth**: JWT + Google OAuth 2.0 (Passport)

## Prasyarat

- Node.js >= 18
- PostgreSQL database 
- Akun Cloudinary 
- Google OAuth credentials 

## Setup Lokal

### 1. Clone & install dependencies

```bash
git clone https://github.com/SyahidAbdulAzis/final-project.git
cd final-project
```

Install backend:
```bash
cd apps/api
npm install
```

Install frontend:
```bash
cd apps/web
npm install
```

### 2. Konfigurasi environment

Copy `.env.example` ke `.env` di masing-masing app:

**`apps/api/.env`:**
```
PORT=8000
DATABASE_URL=postgresql://user:password@localhost:5432/property_renting
JWT_SECRET=your_jwt_secret

# Email (Mailtrap / Gmail SMTP)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_pass
MAIL_FROM=noreply@stayease.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**`apps/web/.env`:**
```
VITE_API_URL=http://localhost:8000/api
```

### 3. Setup database

Generate Prisma client:
```bash
cd apps/api
npm run prisma:generate
```

Jalankan migrasi:
```bash
npm run prisma:migrate
```

Seed data (opsional, untuk data dummy):
```bash
npm run seed
```

## Cara Run

Jalankan backend dan frontend di terminal terpisah:

**Backend** (port 8000):
```bash
cd apps/api
npm run dev
```

**Frontend** (port 5173):
```bash
cd apps/web
npm run dev
```

Akses:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Prisma Studio: `npx prisma studio` (http://localhost:5555)

## Test Accounts (setelah seed)

| Role   | Email                  | Password      |
|--------|------------------------|---------------|
| User   | user1@example.com      | password123   |
| User   | user2@example.com      | password123   |
| Tenant | tenant1@example.com    | password123   |
| Tenant | tenant2@example.com    | password123   |

## Scripts

### Backend (`apps/api`)
| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan server development (hot reload) |
| `npm run build` | Compile TypeScript ke `dist/` |
| `npm start` | Jalankan server production |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Jalankan migrasi database |
| `npm run seed` | Isi database dengan data dummy |

### Frontend (`apps/web`)
| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan Vite dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview hasil build |
