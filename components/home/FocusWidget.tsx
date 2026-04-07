"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface Task {
    id: string
    content: string
    status: string
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

export function FocusWidget({ initialTasks, today }: FocusWidgetProps) {
    const [tasks, setTasks] = useState(initialTasks)
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loadingEvents, setLoadingEvents] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("/api/calendar/today")
                if (res.ok) {
                    const data = await res.json()
                    setEvents(data.events || [])
                }
            } catch (error) {
                console.error("Failed to fetch calendar events", error)
            } finally {
                setLoadingEvents(false)
            }
        }
        fetchEvents()
    }, [])

    const toggleTask = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === "COMPLETED" ? "NOT_STARTED" : "COMPLETED"

        // Optimistic update
        setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))

        try {
            await fetch("/api/planning", {
                method: "PUT",
                body: JSON.stringify({ id, status: newStatus }),
                headers: { "Content-Type": "application/json" },
            })
        } catch (error) {
            console.error("Failed to update task", error)
            // Revert on error
            setTasks(tasks.map(t => t.id === id ? { ...t, status: currentStatus } : t))
        }
    }

    return (
        <Card className="bg-card/50 backdrop-blur-md border-border/30 h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Calendar className="h-4 w-4 text-primary" /> Today's Focus ({today})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 overflow-y-auto pr-2">

                {/* Section 1: Tasks */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Tasks</h3>
                    <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => toggleTask(task.id, task.status)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group",
                                            task.status === 'COMPLETED'
                                                ? "bg-green-500/10 hover:bg-green-500/20"
                                                : "bg-muted/50 hover:bg-muted/80"
                                        )}
                                    >
                                        <div className="relative">
                                            <AnimatePresence mode="wait">
                                                {task.status === 'COMPLETED' ? (
                                                    <motion.div
                                                        key="checked"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="unchecked"
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                    >
                                                        <Circle className="h-5 w-5 text-zinc-500 group-hover:text-primary transition-colors" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <span className={cn(
                                            "transition-all duration-300 font-medium text-sm",
                                            task.status === 'COMPLETED' ? "line-through text-muted-foreground" : "text-foreground"
                                        )}>
                                            {task.content}
                                        </span>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-sm text-muted-foreground italic"
                                >
                                    No tasks. <Link href="/planning" className="text-primary hover:underline">Plan now</Link>.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Section 2: Calendar Events */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Schedule</h3>
                    <div className="space-y-2">
                        {loadingEvents ? (
                            <div className="animate-pulse space-y-2">
                                <div className="h-10 bg-muted/50 rounded-xl"></div>
                                <div className="h-10 bg-muted/50 rounded-xl"></div>
                            </div>
                        ) : events.length > 0 ? (
                            events.map(event => {
                                let timeString = "All Day";
                                if (!event.isAllDay) {
                                    timeString = format(new Date(event.start), "h:mm a");
                                }

                                return (
                                    <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <div className="p-2 bg-blue-500/20 rounded-full text-blue-600 dark:text-blue-400">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{event.summary || "(No Title)"}</span>
                                            <span className="text-xs text-blue-600 dark:text-blue-300/80">{timeString}</span>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-sm text-muted-foreground italic">
                                No events scheduled.
                            </div>
                        )}
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
