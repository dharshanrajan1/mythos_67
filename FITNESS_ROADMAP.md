# Fitness Tracker Roadmap

Tracks pending enhancements for the Fitness module.

---

## Completed

- **Smart UI Unification** — strength/cardio split is auto-detected; single "Finish & Log" flow
- **Cardio Duration Tracking** — `duration Int?` on `WorkoutLog`; Cardio Trends in Insights drawer
- **Edit Logged Workout** — pencil icon on log entries; full inline edit with `PUT /api/fitness/workout`
- **Mobile Input Visibility** — explicit `text-foreground` on weight/reps inputs
- **Workout Name Pre-fill** — removed spurious auto-fill from workout name → exercise name

---

## Pending

### Plate Calculator Refinement
- Show barbell plate UI only for barbell exercises (keywords: Squat, Bench, Deadlift, Press, Row)
- For isolation moves (Curls), show total weight breakdown without bar-weight context

### Insights Date Handling
- Normalize dates to local midnight in `FitnessAnalytics.tsx` to fix timezone offset bugs

### Heat Map Base Opacity
- Bump base opacity on muscle map paths so low-frequency muscles are still visible

---

## Ideas

- **Ghost Mode** — compare today's intensity against previous best session in real-time
- **Multi-color Muscle Map** — encode soreness levels vs. just frequency
- **Rest Timer Sounds** — custom audio on timer completion

---

*Last Updated: 2026-04-18*
