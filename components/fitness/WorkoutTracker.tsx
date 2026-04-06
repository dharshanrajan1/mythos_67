"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format, startOfWeek, addDays, isToday } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"
import { X, Flame, Dumbbell, Trophy } from "lucide-react"

interface WorkoutLog {
    id: string
    workout: string
    date: string
    isPR: boolean
}

interface WorkoutTrackerProps {
    onDataChange?: (logs: WorkoutLog[]) => void
}

const CATEGORIES: { label: string; keywords: string[]; color: string }[] = [
    { label: "Strength", keywords: ["squat", "bench", "deadlift", "press", "curl", "row", "pull", "push", "lift", "weight", "barbell", "dumbbell", "gym"], color: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
    { label: "Cardio",   keywords: ["run", "jog", "bike", "cycle", "swim", "cardio", "hiit", "sprint", "walk", "treadmill", "elliptical"], color: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
    { label: "Flexibility", keywords: ["stretch", "yoga", "pilates", "mobility", "foam"], color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
    { label: "Rest",     keywords: ["rest", "recovery", "off", "active recovery"], color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
]

function getCategory(workout: string) {
    const lower = workout.toLowerCase()
    return CATEGORIES.find(c => c.keywords.some(k => lower.includes(k))) ?? { label: "Training", color: "bg-primary/10 text-primary" }
}

function computeStreak(logs: WorkoutLog[]): number {
    if (!logs.length) return 0
    const uniqueDays = Array.from(new Set(logs.map(l => format(new Date(l.date), 'yyyy-MM-dd')))).sort().reverse()
    let streak = 0
    let cursor = new Date()
    for (const day of uniqueDays) {
        const dayDate = new Date(day)
        const diff = Math.round((new Date(format(cursor, 'yyyy-MM-dd')).getTime() - dayDate.getTime()) / 86400000)
        if (diff <= 1) {
            streak++
            cursor = dayDate
        } else break
    }
    return streak
}

export function WorkoutTracker({ onDataChange }: WorkoutTrackerProps) {
    const [workout, setWorkout] = useState("")
    const [isPR, setIsPR] = useState(false)
    const [data, setData] = useState<WorkoutLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchData = async () => {
        try {
            const res = await fetch("/api/fitness/workout")
            if (res.ok) {
                const logs = await res.json()
                setData(logs)
                onDataChange?.(logs)
            } else {
                if (res.status === 401) setError("Please login to save data")
            }
        } catch {
            setError("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!workout) return
        setError("")
        try {
            const res = await fetch("/api/fitness/workout", {
                method: "POST",
                body: JSON.stringify({ workout, date: new Date(), isPR }),
                headers: { "Content-Type": "application/json" },
            })
            if (!res.ok) {
                setError(res.status === 401 ? "Please login to save data" : "Failed to save")
                return
            }
            setWorkout("")
            setIsPR(false)
            fetchData()
        } catch {
            setError("Failed to save")
        }
    }

    const togglePR = async (id: string, current: boolean) => {
        setData(prev => prev.map(l => l.id === id ? { ...l, isPR: !current } : l))
        try {
            await fetch("/api/fitness/workout", {
                method: "PUT",
                body: JSON.stringify({ id, isPR: !current }),
                headers: { "Content-Type": "application/json" },
            })
        } catch {
            fetchData()
        }
    }

    const deleteLog = async (id: string) => {
        try {
            const res = await fetch(`/api/fitness/workout?id=${id}`, { method: "DELETE" })
            if (res.ok) fetchData()
            else setError("Failed to delete")
        } catch {
            setError("Failed to delete")
        }
    }

    const streak = computeStreak(data)
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const loggedDates = data.map(l => format(new Date(l.date), 'yyyy-MM-dd'))

    return (
        <div className="space-y-6">
            {/* Streak + week dots */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full">
                    <Flame className="h-4 w-4" />
                    <span className="text-sm font-semibold">{streak} day streak</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {weekDays.map((day) => {
                        const key = format(day, 'yyyy-MM-dd')
                        const active = loggedDates.includes(key)
                        const today = isToday(day)
                        return (
                            <div key={key} className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors
                                ${active ? 'bg-primary text-primary-foreground' : today ? 'bg-muted/60 text-foreground ring-1 ring-primary/40' : 'bg-muted/30 text-muted-foreground'}`}>
                                {format(day, 'EEEEE')}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <label htmlFor="workout" className="text-xs text-muted-foreground mb-1.5 block">Log workout</label>
                        <Input
                            id="workout"
                            value={workout}
                            onChange={(e) => setWorkout(e.target.value)}
                            placeholder="e.g. Leg Day — Squats, Lunges..."
                            className="h-9"
                        />
                    </div>
                    <Button type="submit" size="sm" className="h-9 px-5">Add</Button>
                </div>
                {/* PR toggle */}
                <button
                    type="button"
                    onClick={() => setIsPR(v => !v)}
                    className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ring-1 transition-all
                        ${isPR ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-amber-400/40' : 'ring-border/40 text-muted-foreground hover:text-foreground bg-muted/20'}`}
                >
                    <Trophy className="h-3 w-3" />
                    Mark as PR
                </button>
            </form>
            {error && <p className="text-xs text-destructive">{error}</p>}

            {/* Log list */}
            <div className="space-y-2">
                {isLoading ? (
                    <div className="text-sm text-muted-foreground py-4 text-center">Loading...</div>
                ) : data.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        <AnimatePresence mode="popLayout">
                            {data.map((log) => {
                                const cat = getCategory(log.workout)
                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-3 min-w-0">
                                            <Dumbbell className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{log.workout}</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 ml-3">
                                            {log.isPR && (
                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                                    <Trophy className="h-3 w-3" /> PR
                                                </span>
                                            )}
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>{cat.label}</span>
                                            <button
                                                onClick={() => togglePR(log.id, log.isPR)}
                                                title={log.isPR ? "Remove PR" : "Mark as PR"}
                                                className="text-muted-foreground/40 hover:text-amber-500 transition-colors p-1 rounded"
                                            >
                                                <Trophy className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={() => deleteLog(log.id)}
                                                className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground py-6 text-center">No workouts logged yet</div>
                )}
            </div>
        </div>
    )
}
