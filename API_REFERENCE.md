# Meridian — API Reference

All routes require an authenticated session (JWT via NextAuth). Unauthenticated requests return `401 Unauthorized`.

---

## Auth

### `POST /api/register`
Create a new credentials-based user.

**Body:**
```json
{ "name": "string", "email": "string", "password": "string" }
```

**Response:** `201` — `{ id, name, email }`

---

## Diary

### `GET /api/diary`
Returns all diary entries for the authenticated user.

**Query params:**
- `?date=YYYY-MM-DD` — returns the single entry for that date (or `null`)

**Response (all):** `[{ id, date, content, rating, createdAt, updatedAt }]`
- `rating`: `"GOOD" | "MID" | "BAD" | null`

**Response (single date):** `{ id, date, content, rating, ... } | null`

### `POST /api/diary`
Upsert a diary entry by date (one per day per user).

**Body:**
```json
{ "date": "YYYY-MM-DD", "content": "string", "rating": "GOOD" | "MID" | "BAD" | null }
```

**Response:** Full `DiaryEntry` object.

---

## Planning

### `GET /api/planning`
Fetch tasks for a week/day.

**Query params:**
- `?weekOf=YYYY-MM-DD` — ISO Monday of the target week (omit for current week)
- `?day=Monday` — filter to a specific weekday

**Response:** `[{ id, content, notes, status, day, priority, weekOf, gcalEventId, startTime, endTime, createdAt, updatedAt }]`

### `POST /api/planning`
Create a new task.

**Body:**
```json
{
  "content": "string",
  "day": "Monday",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "weekOf": "YYYY-MM-DD",
  "notes": "string (optional)",
  "startTime": "HH:MM (optional)",
  "endTime": "HH:MM (optional)"
}
```

**Response:** Full `Task` object.

### `PUT /api/planning`
Update a task.

**Body:** `{ "id": "string", ...fields to update }` — any subset of `content`, `status`, `day`, `priority`, `notes`, `startTime`, `endTime`.

**Response:** Updated `Task` object.

### `DELETE /api/planning`
Delete a task (and its linked GCal event if present).

**Query params:**
- `?id=<taskId>` — delete single task
- `?all=true&weekOf=YYYY-MM-DD` — delete all tasks for a week

**Response:** `200 OK`

---

### `POST /api/planning/sync`
Push tasks to Google Calendar. Creates or updates events (stores returned `gcalEventId` on the task).

**Body:** `{ "weekOf": "YYYY-MM-DD" }`

**Response:** `{ synced: number }`

### `GET /api/planning/gcal`
Fetch this week's Google Calendar events.

**Response:** `[{ id, summary, start, end, htmlLink }]` (GCal event shape)

---

## Fitness — Weight

### `GET /api/fitness/weight`
Returns the last 30 weight logs, newest first.

**Response:** `[{ id, date, weight, createdAt }]`

### `POST /api/fitness/weight`
Log a new weight entry.

**Body:** `{ "date": "ISO string", "weight": number }`

**Response:** Full `WeightLog` object.

### `DELETE /api/fitness/weight`
Delete a weight log entry.

**Query params:** `?id=<weightLogId>`

**Response:** `200 OK`

---

## Fitness — Workout

### `GET /api/fitness/workout`
Returns the last 100 workout logs, newest first.

**Response:**
```json
[{
  "id": "string",
  "date": "ISO string",
  "workout": "string",
  "isPR": boolean,
  "exercises": [{ "name": "string", "sets": [{ "weight": number, "reps": number, "isPR": boolean }] }] | null,
  "duration": number | null,
  "notes": "string | null",
  "createdAt": "ISO string"
}]
```

### `POST /api/fitness/workout`
Log a new workout.

**Body:**
```json
{
  "workout": "string",
  "date": "ISO string",
  "isPR": boolean,
  "exercises": [...] | null,
  "duration": number | null,
  "notes": "string | null"
}
```

**Response:** Full `WorkoutLog` object.

### `PUT /api/fitness/workout`
Update an existing workout log.

**Body:** `{ "id": "string", ...any of: workout, isPR, exercises, duration, notes }`

**Response:** Updated `WorkoutLog` object.

### `DELETE /api/fitness/workout`
Delete a workout log.

**Query params:** `?id=<workoutLogId>`

**Response:** `200 OK`

---

## Media

### `GET /api/media`
Returns all media items for the user.

**Query params:**
- `?type=BOOK|MOVIE|TV_SHOW` — filter by type

**Response:** `[{ id, title, type, status, rating, notes, posterUrl, externalId, year, author, rank, createdAt, updatedAt }]`

### `POST /api/media`
Add a media item.

**Body:**
```json
{
  "title": "string",
  "type": "BOOK" | "MOVIE" | "TV_SHOW",
  "status": "WANT_TO" | "IN_PROGRESS" | "DONE",
  "rating": number | null,
  "notes": "string | null",
  "posterUrl": "string | null",
  "externalId": "string | null",
  "year": number | null,
  "author": "string | null"
}
```

**Response:** Full `MediaItem` object.

### `PATCH /api/media`
Update a media item or reorder ranks.

**Body (update):** `{ "id": "string", ...fields to update }`

**Body (reorder):** `{ "reorder": [{ "id": "string", "rank": number }] }` — batch rank update for drag-to-reorder.

**Response:** Updated `MediaItem` object (or `200 OK` for reorder).

### `DELETE /api/media`
Delete a media item.

**Query params:** `?id=<mediaItemId>`

**Response:** `200 OK`

---

### `GET /api/media/search`
Search for books (OpenLibrary) or movies/TV (TMDB).

**Query params:**
- `?q=<search term>` — search query
- `?type=BOOK|MOVIE|TV_SHOW`

**Response:** `[{ title, year, author, posterUrl, externalId, type }]`

### `POST /api/media/letterboxd`
Import watchlist from Letterboxd (RSS feed + TMDB enrichment, capped at 100 items).

**Body:** `{ "username": "string" }`

**Response:** `{ imported: number, skipped: number }`

---

## Countdowns

### `GET /api/countdowns`
Returns all countdown events, ordered by date ascending.

**Response:** `[{ id, title, date, createdAt }]`

### `POST /api/countdowns`
Create a countdown event.

**Body:** `{ "title": "string", "date": "ISO string" }`

**Response:** Full `Countdown` object.

### `DELETE /api/countdowns`
Delete a countdown.

**Query params:** `?id=<countdownId>`

**Response:** `200 OK`

---

## Mind Dump

### `GET /api/mind-dump`
Returns all note blocks, newest first.

**Response:** `[{ id, content, type, createdAt, updatedAt }]`
- `type`: `"text" | "link" | "idea" | "youtube"`

### `POST /api/mind-dump`
Create a note block. Link and YouTube types auto-fetch titles.

**Body:** `{ "content": "string", "type": "text" | "link" | "idea" | "youtube" }`

**Response:** Full `NoteBlock` object.

### `DELETE /api/mind-dump`
Delete a note block.

**Query params:** `?id=<noteBlockId>`

**Response:** `200 OK`

---

## Calendar

### `GET /api/calendar/today`
Returns today's Google Calendar events (used by the home dashboard widget).

**Response:** `[{ id, summary, start, end, htmlLink }]`

---

## Upload

### `POST /api/upload`
Upload a file to Vercel Blob storage.

**Body:** `multipart/form-data` with `file` field.

**Response:** `{ url: "string" }` — public Vercel Blob URL.

### `GET /api/upload`
Returns all progress photos for the user.

**Response:** `[{ id, date, url, caption, createdAt }]`

### `DELETE /api/upload`
Delete a progress photo and its Vercel Blob object.

**Query params:** `?id=<photoId>`

**Response:** `200 OK`

---

## Dashboard

### `GET /api/dashboard`
Returns aggregated data for the lock-screen dashboard view.

**Response:** Combined object with recent tasks, diary entries, weight logs, workouts, and countdowns.
