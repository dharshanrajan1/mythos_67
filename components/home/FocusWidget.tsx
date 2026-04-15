"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { format, isValid } from "date-fns"
import {
    CheckCircle2, Circle, Clock, CalendarDays,
    ArrowRight, Flame,
} from "lucide-react"

interface Task {
    id: string
    content: string
    status: string
    startTime?: string | null
}

interface CalendarEvent {
    id: string
    summary: string
    start: string
    end: string
    isAllDay: boolean
}

interface FocusWidgetProps {
    initialTasks: Task[]
    today: string
}

// Time-of-day accent colour (matches the old GCal widget)
function accentForHour(start: string, isAllDay: boolean): string {
    if (isAllDay) return "bg-primary/50"
    try {
        const hour = new Date(start).getHours()
        if (hour < 9)  return "bg-violet-400"
        if (hour < 12) return "bg-sky-400"
        if (hour < 17) return "bg-emerald-400"
        return "bg-amber-400"
    } catch { return "bg-primary/50" }
}

function accentTextForHour(start: string, isAllDay: boolean): string {
    if (isAllDay) return "text-primary/80"
    try {
        const hour = new Date(start).getHours()
        if (hour < 9)  return "text-violet-400"
        if (hour < 12) return "text-sky-400"
        if (hour < 17) return "text-emerald-400"
        return "text-amber-400"
    } catch { return "text-primary/80" }
}

function formatTime(start: string, isAllDay: boolean): string {
    if (isAllDay) return "All day"
    try {
        const d = new Date(start)
        if (!isValid(d)) return ""
        return format(d, "h:mm a")
    } catch { return "" }
}

export function FocusWidget({ initialTasks, today: serverToday }: FocusWidgetProps) {
    const [tasks,         setTasks]         = useState(initialTasks)
    const [events,        setEvents]        = useState<CalendarEvent[]>([])
    const [loading,       setLoading]       = useState(true)
    const [gcalConnected, setGcalConnected] = useState<boolean | null>(null)
    const [today,         setToday]         = useState(serverToday)
    const [dateLabel,     setDateLabel]     = useState("")

    useEffect(() => {
        const localDate = new Date()
        const localDay  = format(localDate, "EEEE")
        setToday(localDay)
        setDateLabel(format(localDate, "EEEE, MMM d"))

        const getMondayKey = (d: Date) => {
            const dow = d.getDay()
            const mon = new Date(d)
            mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
            return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`
        }

        const fetchAll = async () => {
            try {
                const weekOf = getMondayKey(localDate)
                const [taskRes, evRes] = await Promise.all([
                    fetch(`/api/planning?weekOf=${weekOf}&day=${localDay}`),
                    fetch(`/api/calendar/today?timeMin=${new Date(localDate.setHours(0,0,0,0)).toISOString()}&timeMax=${new Date(new Date().setHours(23,59,59,999)).toISOString()}`),
                ])
                if (taskRes.ok) setTasks(await taskRes.json())
                if (evRes.ok) {
                    const data = await evRes.json()
                    setGcalConnected(data.connected ?? false)
                    setEvents(data.events ?? [])
                }
            } catch { /* fail silently */ }
            finally { setLoading(false) }
        }
        fetchAll()
    }, [])

    const toggleTask = async (id: string, currentStatus: string) => {
        const next = currentStatus === "COMPLETED" ? "NOT_STARTED" : "COMPLETED"
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: next } : t))
        try {
            await fetch("/api/planning", {
                method: "PUT",
                body: JSON.stringify({ id, status: next }),
                headers: { "Content-Type": "application/json" },
            })
        } catch {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, status: currentStatus } : t))
        }
    }

    const done  = tasks.filter(t => t.status === "COMPLETED").length
    const total = tasks.length
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0

    // Merge timed tasks into the schedule, sorted alongside GCal events
    const timedTasks = tasks
        .filter(t => t.startTime)
        .map(t => ({
            id:      `task-${t.id}`,
            summary: t.content,
            start:   `2000-01-01T${t.startTime}:00`,   // dummy date — only time matters for display
            end:     "",
            isAllDay: false,
            isTask:  true,
            completed: t.status === "COMPLETED",
        }))

    const gcalItems = events.map(e => ({ ...e, isTask: false, completed: false }))

    const scheduleItems = [...gcalItems, ...timedTasks].sort((a, b) => {
        if (a.isAllDay && !b.isAllDay) return -1
        if (!a.isAllDay && b.isAllDay) return 1
        return new Date(a.start).getHours() - new Date(b.start).getHours()
    })

    return (
        <div className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-md p-5 flex flex-col gap-5">

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-base font-bold tracking-tight leading-none">{dateLabel || today}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        {loading ? "Loading…" : total === 0 ? "No tasks today" : `${done} of ${total} tasks done`}
                    </p>
                </div>
                {total > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        <Flame className="h-3.5 w-3.5" />
                        {pct}%
                    </div>
                )}
            </div>

            {/* ── Task progress bar ── */}
            {total > 0 && (
                <div className="h-1 rounded-full bg-border/40 overflow-hidden -mt-2">
                    <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                </div>
            )}

            {/* ── Tasks ── */}
            <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Tasks
                </p>

                {loading ? (
                    <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-10 rounded-xl bg-muted/40 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {tasks.length > 0 ? tasks.map(task => (
                            <motion.button
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onClick={() => toggleTask(task.id, task.status)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                                    task.status === "COMPLETED"
                                        ? "bg-emerald-500/8 hover:bg-emerald-500/12"
                                        : "bg-muted/40 hover:bg-muted/60"
                                )}
                            >
                                <AnimatePresence mode="wait">
                                    {task.status === "COMPLETED" ? (
                                        <motion.span key="done"
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                                        </motion.span>
                                    ) : (
                                        <motion.span key="todo"
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                <span className={cn(
                                    "text-sm font-medium flex-1 leading-snug",
                                    task.status === "COMPLETED"
                                        ? "line-through text-muted-foreground"
                                        : "text-foreground"
                                )}>
                                    {task.content}
                                </span>
                                {task.startTime && (
                                    <span className="text-[10px] text-sky-400 font-medium shrink-0">
                                        {format(new Date(`2000-01-01T${task.startTime}:00`), "h:mm a")}
                                    </span>
                                )}
                            </motion.button>
                        )) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex items-center justify-between px-1 py-1">
                                <p className="text-sm text-muted-foreground">Nothing planned.</p>
                                <Link href="/planning"
                                    className="text-xs text-primary hover:underline flex items-center gap-0.5">
                                    Plan now <ArrowRight className="h-3 w-3" />
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* ── Schedule (GCal events + timed tasks) ── */}
            {gcalConnected !== false && (
                <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Schedule
                    </p>

                    {loading ? (
                        <div className="space-y-2">
                            <div className="h-10 rounded-xl bg-muted/40 animate-pulse" />
                        </div>
                    ) : scheduleItems.length > 0 ? (
                        <div className="space-y-1.5">
                            {scheduleItems.map((item, i) => {
                                const accent     = accentForHour(item.start, item.isAllDay)
                                const accentText = accentTextForHour(item.start, item.isAllDay)
                                const timeLabel  = formatTime(item.start, item.isAllDay)
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                                            item.isTask
                                                ? "bg-primary/5 border border-primary/10"
                                                : "bg-muted/30 hover:bg-muted/50"
                                        )}
                                    >
                                        <span className={cn("w-0.5 h-7 rounded-full shrink-0", accent)} />
                                        <div className="min-w-0 flex-1">
                                            <p className={cn(
                                                "text-xs font-semibold truncate leading-snug",
                                                "completed" in item && item.completed
                                                    ? "line-through text-muted-foreground"
                                                    : "text-foreground"
                                            )}>
                                                {item.summary ?? "Untitled"}
                                            </p>
                                            {timeLabel && (
                                                <p className={cn("text-[10px] font-medium mt-0.5", accentText)}>
                                                    {timeLabel}
                                                    {item.isTask && (
                                                        <span className="text-muted-foreground/50 ml-1">· task</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                        {!item.isTask && (
                                            <CalendarDays className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground px-1">Nothing scheduled.</p>
                    )}
                </div>
            )}

            {/* ── Footer ── */}
            <div className="flex items-center justify-between pt-1 border-t border-border/20">
                <Link href="/planning"
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    Weekly plan <ArrowRight className="h-3 w-3" />
                </Link>
                <Link href="/diary"
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    Journal <ArrowRight className="h-3 w-3" />
                </Link>
            </div>
        </div>
    )
}
