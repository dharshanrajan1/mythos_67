# Meridian — Architecture & Developer Guide

Deep technical reference. Read this to get up to speed on how the app is structured, how data flows, and where things live.

---

## Directory Map

```
/
├── app/                        Next.js App Router
│   ├── page.tsx                Home dashboard (SSR, server component)
│   ├── layout.tsx              Root layout — providers, fonts, Navbar
│   ├── manifest.ts             PWA manifest
│   ├── sw.ts                   Serwist service worker entry
│   ├── diary/
│   │   ├── page.tsx            Diary list + calendar
│   │   └── [date]/page.tsx     Single diary entry editor
│   ├── fitness/page.tsx        Fitness hub (tabs)
│   ├── planning/page.tsx       Kanban weekly planner
│   ├── mind-dump/page.tsx      Quick note capture
│   ├── media/page.tsx          Books / movies / TV tracker
│   ├── dashboard/page.tsx      Lock-screen widget view
│   ├── login/page.tsx          Login form
│   ├── signup/page.tsx         Registration form
│   └── api/                    REST API handlers
│       ├── auth/[...nextauth]/ NextAuth auto-handler
│       ├── register/           User signup (POST)
│       ├── diary/              GET (list or single), POST (upsert)
│       ├── planning/           Full CRUD + GCal delete on task delete
│       ├── planning/sync/      POST — push tasks → Google Calendar
│       ├── planning/gcal/      GET — pull events from Google Calendar
│       ├── fitness/weight/     GET/POST/DELETE weight logs
│       ├── fitness/workout/    GET/POST workout logs
│       ├── media/              GET/POST/PATCH/DELETE media items
│       ├── countdowns/         GET/POST/DELETE countdowns
│       ├── mind-dump/          GET/POST/DELETE note blocks
│       ├── calendar/today/     GET today's GCal events (home widget)
│       ├── upload/             POST file → Vercel Blob
│       └── dashboard/          GET aggregated dashboard data
│
├── components/
│   ├── Clock.tsx               Live clock (client)
│   ├── Greeting.tsx            Time-based greeting
│   ├── Navbar.tsx              Top nav with auth state
│   ├── ThemeSwitcher.tsx       Dark/light toggle
│   ├── home/
│   │   ├── FocusWidget.tsx     Today's tasks inline editor
│   │   ├── WeeklyRecap.tsx     Last-week stats summary
│   │   ├── UnifiedActivityFeed.tsx  Recent cross-app activity
│   │   ├── CountdownWidget.tsx Countdown events
│   │   ├── GoogleCalendarWidget.tsx Today's calendar events
│   │   ├── WeatherWidget.tsx   Weather (geolocation API)
│   │   └── DailyQuote.tsx      Random motivational quote
│   ├── diary/
│   │   ├── DiaryEditor.tsx     Rich text diary editor
│   │   └── DiaryCalendar.tsx   Month-view calendar with entry dots
│   ├── fitness/
│   │   ├── WorkoutTracker.tsx  Smart workout logger (strength + cardio)
│   │   ├── WeightTracker.tsx   Body weight log + sparkline chart
│   │   ├── FitnessAnalytics.tsx Charts — volume, frequency, PRs
│   │   ├── MuscleMap.tsx       SVG heat-map driven by muscle-mapping.ts
│   │   ├── PRBoard.tsx         Personal records leaderboard
│   │   ├── PlateCalculator.tsx Barbell plate calculator
│   │   ├── RestTimer.tsx       Countdown timer with sound
│   │   └── ProgressGallery.tsx Photo timeline (Vercel Blob URLs)
│   ├── planning/
│   │   ├── KanbanBoard.tsx     Week-based kanban container
│   │   ├── KanbanColumn.tsx    Single day column (@dnd-kit droppable)
│   │   ├── KanbanCard.tsx      Task card (@dnd-kit draggable)
│   │   └── TaskItem.tsx        Inline task editor
│   ├── dashboard/
│   │   └── DashboardGrid.tsx   Lock-screen widget grid
│   ├── mind-dump/
│   │   └── MindDump.tsx        Note capture + display (text/link/idea/youtube)
│   ├── providers/
│   │   ├── NextAuthProvider.tsx  SessionProvider wrapper
│   │   └── ThemeProvider.tsx     next-themes wrapper
│   └── ui/
│       ├── button.tsx, card.tsx, input.tsx, label.tsx, select.tsx, textarea.tsx
│       ├── ParticleBackground.tsx  Animated canvas particles
│       ├── BackgroundBlobs.tsx     Gradient blob decorations
│       └── MobileActionDrawer.tsx  Bottom sheet for mobile quick actions
│
├── lib/
│   ├── auth.ts         NextAuth config (see Auth section)
│   ├── prisma.ts       Singleton PrismaClient (prevents hot-reload leaks)
│   ├── google.ts       getGoogleOAuthClient() — reads tokens from DB, auto-refreshes
│   ├── muscle-mapping.ts  MUSCLE_MAPPING dict: exercise name → MuscleGroup[]
│   ├── progression.ts  Workout progression analysis helpers
│   └── utils.ts        cn() (clsx + tailwind-merge)
│
├── hooks/
│   └── use-debounce.ts  useDebounce hook
│
├── types/
│   └── next-auth.d.ts  Augments Session to include user.id
│
├── prisma/
│   └── schema.prisma   Source of truth for all DB models
│
└── middleware.ts        Route auth enforcement via withAuth()
```

---

## Auth

**Strategy:** JWT (no DB sessions). `lib/auth.ts` configures NextAuth v4.

**Providers:**
- `GoogleProvider` — requests `calendar` scope + `offline` access. `allowDangerousEmailAccountLinking: true` so Google can link to an existing credentials account with the same email.
- `CredentialsProvider` — email + bcryptjs password (salt 12). Checks `User.password`.

**JWT callbacks:**
- `jwt` — on initial sign-in, copies `account.access_token`, `account.refresh_token` into the token.
- `session` — copies `token.id`, `token.accessToken`, `token.refreshToken` onto the session object so server components and API routes can get them via `getServerSession(authOptions)`.

**Middleware (`middleware.ts`):** Uses `withAuth` to protect all routes except `/api/auth/*`, `/api/register`, `/_next/*`, `/login`, `/signup`.

**Token refresh (`lib/google.ts`):** `getGoogleOAuthClient(userId)` reads the Google `Account` row from the DB, sets credentials on a `google.auth.OAuth2` client, and listens for `"tokens"` events to persist refreshed tokens back to the DB automatically.

---

## Database Models

All models cascade-delete on `User` deletion. IDs are CUIDs. Timestamps: `createdAt` + `updatedAt` where relevant.

### User
Standard NextAuth fields + `password String?` for credentials auth.

### Account / Session / VerificationToken
Standard NextAuth adapter models. `Account` stores Google OAuth tokens (`access_token`, `refresh_token`, `expires_at`).

### DiaryEntry
- Unique constraint: `(userId, date)` — one entry per day.
- `rating`: `"GOOD" | "MID" | "BAD" | null`
- `content`: free text (markdown-like, rendered in editor)
- API: `POST /api/diary` upserts by date. `GET /api/diary` with no `date` param returns all dates + ratings + 140-char excerpts.

### WeightLog
- `weight Float` in kg (or whatever unit the user enters — no unit enforcement).
- `date DateTime`

### WorkoutLog
- `workout String` — free-text name (e.g. "Push Day", "5K Run")
- `isPR Boolean` — manually flagged
- `exercises Json?` — structured as `Array<{name: string, sets: [{weight: number, reps: number, isPR: boolean}]}>`
- `duration Int?` — minutes (for cardio)
- `notes String?` — free-text (cardio pace, distance, etc.)
- The `exercises` JSON is what drives the muscle heat-map and PR detection.

### Task
- `day String` — day of week (`"Monday"` through `"Sunday"`)
- `weekOf String?` — `"YYYY-MM-DD"` of the Monday of that week. `null` = legacy pre-weekOf tasks, treated as current week.
- `status`: `"NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"`
- `priority`: `"HIGH" | "MEDIUM" | "LOW"`
- `gcalEventId String?` — Google Calendar event ID. Present when the task has been synced to GCal. On task delete, the linked GCal event is deleted first.

### NoteBlock
- `type String` — `"text" | "link" | "idea" | "youtube"`
- `content String` — raw text, or JSON string with `{url, text}` for link/youtube types. Link type auto-fetches `og:title`. YouTube type auto-fetches video title via oEmbed.

### MediaItem
- `type String` — `"BOOK" | "MOVIE" | "TV_SHOW"`
- `status String` — `"WANT_TO" | "IN_PROGRESS" | "DONE"`
- `rating Int?` — 1–5
- `rank Float?` — fractional rank within DONE items (lower = better). Used for drag-to-reorder within the Done list.
- `posterUrl String?` — TMDB poster URL or Google Books thumbnail.
- `externalId String?` — TMDB ID or Google Books volume ID.

### Countdown
- `title String`, `date DateTime` — simple countdown events shown on the home dashboard.

---

## API Routes

All routes authenticate via `getServerSession(authOptions)` and return 401 if no session.

| Route | Methods | Notes |
|---|---|---|
| `/api/register` | POST | Creates user with bcrypt-hashed password |
| `/api/diary` | GET, POST | GET with `?date=YYYY-MM-DD` returns single entry; without returns all. POST upserts. |
| `/api/planning` | GET, POST, PUT, DELETE | GET supports `?weekOf=` and `?day=`. DELETE supports `?id=` or `?all=true&weekOf=`. On DELETE by id, linked GCal event is deleted first. |
| `/api/planning/sync` | POST | Pushes all tasks for a week to Google Calendar (creates/updates events). |
| `/api/planning/gcal` | GET | Returns today's Google Calendar events. |
| `/api/fitness/weight` | GET, POST, DELETE | Weight log CRUD. |
| `/api/fitness/workout` | GET, POST | Workout log. GET returns all logs desc. |
| `/api/media` | GET, POST, PATCH, DELETE | Full CRUD. PATCH used for rank reordering. |
| `/api/countdowns` | GET, POST, DELETE | Countdown CRUD. |
| `/api/mind-dump` | GET, POST, DELETE | Note block CRUD. POST auto-fetches titles for link/youtube types. |
| `/api/calendar/today` | GET | Returns today's GCal events (used by home widget). |
| `/api/upload` | POST | Streams file to Vercel Blob, returns URL. |
| `/api/dashboard` | GET | Returns aggregated data for the lock-screen dashboard. |

---

## Google Calendar Sync

Flow for task → GCal:
1. User triggers "Sync to Google Calendar" in the KanbanBoard.
2. `POST /api/planning/sync` is called with the `weekOf` key.
3. For each task, if `gcalEventId` exists → `events.patch`; else → `events.insert`. The returned event ID is stored back on the task.
4. On task DELETE, `/api/planning` DELETE handler calls `calendar.events.delete` before the DB delete (ignores 404s).

`getGoogleOAuthClient(userId)` in `lib/google.ts` handles token refresh transparently.

---

## Muscle Heat-Map

`lib/muscle-mapping.ts` exports `MUSCLE_MAPPING: Record<string, MuscleGroup[]>` — a large dictionary mapping lowercase exercise names to an array of muscle groups.

`components/fitness/MuscleMap.tsx` reads the user's recent `WorkoutLog.exercises` JSON, looks up each exercise in `MUSCLE_MAPPING`, accumulates a frequency count per muscle group, and renders an SVG body diagram with path opacity driven by frequency.

---

## Home Dashboard (SSR)

`app/page.tsx` is a server component. It:
1. Gets session via `getServerSession`.
2. Fetches this week's tasks, recent diary entries, recent weight logs, recent workouts, and countdowns directly from Prisma (not via API routes).
3. Passes data as props to client components (`FocusWidget`, `WeeklyRecap`, `UnifiedActivityFeed`, `CountdownWidget`).
4. `GoogleCalendarWidget` and `WeatherWidget` are client components that fetch their own data on mount.

---

## Planning / Kanban

`KanbanBoard` uses `@dnd-kit` for drag-and-drop between day columns. Week navigation uses `getMondayKey()` (also defined in `/api/planning/route.ts`) to derive the ISO `YYYY-MM-DD` week key. Legacy tasks with `weekOf: null` are treated as belonging to the current week.

---

## PWA

`app/sw.ts` is the Serwist service worker entry. `next.config.ts` wraps the Next config with `withSerwistInit`. The service worker is disabled in `NODE_ENV === "development"`. Manifest is generated by `app/manifest.ts`.

---

## Styling Conventions

- Tailwind CSS 4 (config in `tailwind.config.ts` / CSS variables in `globals.css`)
- Glass-morphism: `backdrop-blur`, semi-transparent backgrounds (`bg-white/10`)
- Particle/blob background decorations on most pages
- Dark mode via `next-themes` (`ThemeProvider`)
- Framer Motion used for page transitions and micro-interactions (e.g. confetti on task complete)

---

## Key Patterns

**Singleton Prisma (`lib/prisma.ts`):** Uses `global.__prisma` to prevent multiple PrismaClient instances during Next.js hot reloads in dev.

**Session type augmentation (`types/next-auth.d.ts`):** Adds `id: string` to `Session.user` so TypeScript knows about the user ID in server components and API routes.

**Optimistic UI:** Client components update local state immediately on user action, then fire the API call. On failure, state is reverted.

**No direct DB from client:** All data access goes through REST API routes, even from server components that could use Prisma directly — except the home page (`app/page.tsx`) which does use Prisma directly for SSR performance.
