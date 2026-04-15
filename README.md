# Meridian — Personal Life OS

A full-stack personal productivity and life-tracking app. Single-user, self-hosted on Vercel with a Neon PostgreSQL database.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| Styling | Tailwind CSS 4 + Framer Motion |
| Auth | NextAuth v4 (JWT + PrismaAdapter) |
| ORM | Prisma 6 |
| Database | Neon PostgreSQL (prod) |
| Storage | Vercel Blob (progress photos) |
| PWA | Serwist 9 (disabled in dev) |
| Icons | Lucide React |
| Drag & Drop | @dnd-kit |

## Quick Start

```bash
cp .env.example .env.local   # fill in vars
npm install
npm run dev                  # http://localhost:3000
```

## Build & Deploy

```bash
npm run build   # prisma generate + db push + webpack build (4 GB memory)
npm run start   # production
```

Deployed on Vercel. Build uses explicit webpack (not Turbopack) for stability. `prisma db push --accept-data-loss` runs non-blocking at build time.

## Environment Variables

```env
DATABASE_POSTGRES_PRISMA_URL          # Neon pooled connection
DATABASE_POSTGRES_URL_NON_POOLING     # Neon direct connection (migrations)
NEXTAUTH_SECRET                       # random string
NEXTAUTH_URL                          # https://your-domain.com
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
BLOB_READ_WRITE_TOKEN                 # Vercel Blob
```

## Key Docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — deep technical guide (components, API, data flow)
- [`CLAUDE.md`](./CLAUDE.md) — AI assistant context
- [`GOOGLE_SETUP.md`](./GOOGLE_SETUP.md) — Google OAuth + Calendar setup
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) — common issues
- [`FITNESS_ROADMAP.md`](./FITNESS_ROADMAP.md) — fitness feature backlog
