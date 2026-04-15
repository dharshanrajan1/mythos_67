# Bug Reports & Feature Gaps

_Last updated: 2026-04-14 — bugs 1, 2, 3, 5 fixed_

---

## 1. Workout name pre-fills first exercise but doesn't stay in sync

**What the user sees:** Typing a workout name (e.g. "Bench Press") pre-fills the first exercise field, but the pre-fill only happens once — if they clear the exercise name or change the workout name after the fact, the exercise field doesn't update. Also confusing when the workout name is a session label ("Push Day") rather than the exercise name — the exercise slot gets "Push Day" which isn't useful.

**Root cause:** `WorkoutTracker.tsx` lines 631–647 — a debounced `useEffect` on `workout` pre-fills the first exercise *once*, only when `prev.length === 1 && !prev[0].name.trim()`. This is a one-shot init. After the user edits the exercise panel, the workout name and exercise name drift independently.

**Fix approach:**
- The workout name field and the exercise name field serve different purposes (session label vs. exercise). They shouldn't be linked.
- Remove the auto-fill behavior entirely, or make it opt-in (small "Copy to exercise" button).
- Make the placeholder on the exercise input clearer ("Exercise name, e.g. Bench Press") and let the workout name be the session label ("Push Day", "Upper", etc.).
- Alternatively, offer a "session name = exercise name" toggle for single-exercise sessions.

---

## 2. Number inputs invisible on mobile while typing

**What the user sees:** When typing weight/rep numbers into the set rows on mobile, the digits don't appear until after the workout is submitted and the log re-renders.

**Root cause:** `WorkoutTracker.tsx` lines 358–371 (weight input) and 409–416 (reps input) — the inputs use `bg-muted/40` background with no explicit text color class. On mobile, especially Safari, `type="number"` inputs in dark-mode glass-morphism contexts can render typed text with a color that matches or is very close to the background (`--muted` vs `--foreground` CSS variable contrast issue). The values _are_ there in state (they submit fine), but they're visually invisible until a re-render forces a repaint.

**Fix approach:**
- Add explicit `text-foreground` (or `text-white dark:text-white`) to the weight and reps input classNames.
- Alternatively add `!text-foreground` to override any inherited muted color.
- Test fix: `className="h-9 sm:h-7 text-sm text-foreground bg-muted/40 text-center font-semibold"`.

---

## 3. No way to edit a logged workout

**What the user sees:** After logging a workout, there is only a delete button and a PR toggle on each log entry. No way to fix a typo in the workout name, adjust a set weight/reps, add missing exercises, or change the duration.

**Root cause:** `LogItem` component (`WorkoutTracker.tsx` lines 511–610) renders an expand/collapse view for exercises but has no edit mode. The API already supports editing — `PUT /api/fitness/workout` accepts `{ id, isPR, exercises, duration, notes }` — but the `workout` name field is not updateable via PUT yet.

**Fix approach:**
- Add an edit (pencil) icon to `LogItem` alongside the delete button.
- On click, replace the display view with an inline edit form: editable workout name, the `ExercisePanel` pre-populated with the existing sets, duration/notes fields.
- On save, call `PUT /api/fitness/workout` with the full updated payload.
- Also extend the PUT handler in `/api/fitness/workout/route.ts` to accept `workout` (name) and `date` as updateable fields.

---

## 4. Planning board is text-only — no time/event structure

**What the user sees:** Tasks on the kanban board are plain text notes sorted into day columns. There's no way to give a task a start/end time, so it doesn't feel like a real calendar. The "sync to Google Calendar" feature exists but dumps tasks as all-day events.

**Root cause:** The `Task` model has no `startTime` / `endTime` fields. The GCal sync in `/api/planning/sync` creates events without a time window, so they land as all-day blocks in Google Calendar.

**Fix approach (phased):**
- **Phase 1 — Add time to tasks:** Add optional `startTime String?` and `endTime String?` fields to the `Task` prisma model (store as `HH:MM`). Surface a time picker in `KanbanCard` / `TaskItem`. When syncing to GCal, pass `start.dateTime` / `end.dateTime` instead of `start.date`.
- **Phase 2 — Day timeline view:** Add a timeline/schedule view to the planning page that shows tasks as positioned blocks on a day grid (like a lightweight Google Calendar day view). `@dnd-kit` can still power drag-to-reschedule.
- **Phase 3 — Pull GCal events into view:** The `GET /api/planning/gcal` route already fetches GCal events. Surface them alongside tasks in the timeline so the user sees both in one place.

---

## 5. Movie & TV search broken (TMDB API key missing)

**What the user sees:** Searching for movies or TV shows in the Media tracker returns no results or an error. Books still work fine.

**Root cause:** `/api/media/search/route.ts` lines 6–7 — the TMDB search uses `process.env.TMDB_READ_ACCESS_TOKEN` (a bearer token, not an API key). This env var is **not listed** in `CLAUDE.md`, `.env.example`, or the README — it was likely never added to the Vercel project environment variables. When it's undefined, every TMDB request returns a 401 from the TMDB API, which the route catches and re-throws as 500 `"Search failed"`.

Books work because they use the Open Library API which requires no auth.

**Fix approach:**
1. Go to [themoviedb.org](https://www.themoviedb.org) → Account → Settings → API → copy the **Read Access Token** (the long JWT, not the API key).
2. In Vercel → Project Settings → Environment Variables, add `TMDB_READ_ACCESS_TOKEN` with that value. Set it for Production + Preview + Development.
3. Add `TMDB_READ_ACCESS_TOKEN` to `.env.example` and the env vars section of `README.md` / `CLAUDE.md` so it's not forgotten again.
4. Optionally surface a clearer error in the UI when search returns 500 — currently the component just shows "No results found" which is misleading.

---

## Summary Table

| # | Area | Severity | Type | Status |
|---|---|---|---|---|
| 1 | Fitness / Workout name | Medium | UX/Logic bug | ✅ Fixed |
| 2 | Fitness / Mobile inputs | High | CSS bug | ✅ Fixed |
| 3 | Fitness / Edit workout | Medium | Missing feature | ✅ Fixed |
| 4 | Planning / Calendar events | Low | Feature gap | ✅ Fixed |
| 5 | Media / Movie search | High | Config/env bug | ✅ Fixed (add TMDB_READ_ACCESS_TOKEN to Vercel) |
