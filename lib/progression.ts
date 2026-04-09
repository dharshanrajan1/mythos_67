// Progression tip engine — detects when a user is stuck at the same weight
// and gently recommends a small increase.

export interface ProgressionTip {
  exerciseName: string
  type: "increase_weight" | "chase_reps"
  message: string
  suggestedWeight?: number
  currentWeight: number
  sessionsStuck: number
}

interface SetData {
  weight: number
  reps: number
}

interface ExerciseData {
  name: string
  sets: SetData[]
}

interface LogEntry {
  date: string
  exercises?: ExerciseData[] | null
}

/** Sessions needed at the same weight before we nudge. */
const STALL_THRESHOLD = 3

/** Rep average above which we suggest bumping weight vs. chasing reps. */
const REP_THRESHOLD = 9

/**
 * Return the smallest standard plate increment for a given weight.
 * Heavier barbell work → +5 lbs; lighter dumbbell work → +2.5 lbs.
 */
function increment(weight: number): number {
  return weight >= 100 ? 5 : 2.5
}

/**
 * Analyse logs for a single exercise and return a progression tip if the user
 * has been at the same max-weight for >= STALL_THRESHOLD consecutive sessions.
 */
export function getProgressionTip(
  exerciseName: string,
  logs: LogEntry[]
): ProgressionTip | null {
  const lower = exerciseName.toLowerCase().trim()
  if (!lower) return null

  // Collect per-session stats, oldest first
  const sessions = logs
    .filter(l => l.exercises?.some(e => e.name.toLowerCase() === lower))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(l => {
      const ex = l.exercises!.find(e => e.name.toLowerCase() === lower)!
      const valid = ex.sets.filter(s => s.weight > 0 && s.reps > 0)
      const maxWeight = valid.length ? Math.max(...valid.map(s => s.weight)) : 0
      const avgReps = valid.length
        ? valid.reduce((sum, s) => sum + s.reps, 0) / valid.length
        : 0
      return { maxWeight, avgReps }
    })
    .filter(s => s.maxWeight > 0)

  if (sessions.length < STALL_THRESHOLD) return null

  // Count how many recent sessions share the same max weight
  const latestWeight = sessions.at(-1)!.maxWeight
  let sessionsStuck = 0
  for (let i = sessions.length - 1; i >= 0; i--) {
    if (sessions[i].maxWeight === latestWeight) sessionsStuck++
    else break
  }

  if (sessionsStuck < STALL_THRESHOLD) return null

  const recentAvgReps =
    sessions
      .slice(-STALL_THRESHOLD)
      .reduce((sum, s) => sum + s.avgReps, 0) / STALL_THRESHOLD

  if (recentAvgReps >= REP_THRESHOLD) {
    // High reps at this weight → ready to bump load
    const next = latestWeight + increment(latestWeight)
    return {
      exerciseName,
      type: "increase_weight",
      message: `You've been doing ${latestWeight} lbs for ${sessionsStuck} sessions. Try ${next} lbs — your rep count supports it.`,
      suggestedWeight: next,
      currentWeight: latestWeight,
      sessionsStuck,
    }
  } else {
    // Moderate/low reps — push reps first before jumping weight
    return {
      exerciseName,
      type: "chase_reps",
      message: `Same weight for ${sessionsStuck} sessions. Focus on squeezing 1–2 extra reps before bumping the load.`,
      currentWeight: latestWeight,
      sessionsStuck,
    }
  }
}

/**
 * Scan all logged exercises and return one tip per stalled exercise.
 * Useful for the analytics/insights dashboard view.
 */
export function getAllProgressionTips(logs: LogEntry[]): ProgressionTip[] {
  const names = new Set<string>()
  logs.forEach(l => l.exercises?.forEach(e => names.add(e.name)))

  const tips: ProgressionTip[] = []
  for (const name of names) {
    const tip = getProgressionTip(name, logs)
    if (tip) tips.push(tip)
  }

  // Surface weight-increase tips first
  return tips.sort((a, b) => {
    if (a.type !== b.type) return a.type === "increase_weight" ? -1 : 1
    return b.sessionsStuck - a.sessionsStuck
  })
}
