"use client"

import { useState, useMemo } from "react"
import {
    format, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, addDays,
    addMonths, subMonths,
    isSameMonth, isSameDay, isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface EntryMeta {
    date: string
    rating: string | null
    excerpt: string
}

interface DiaryCalendarProps {
    entries: EntryMeta[]
    selectedDate: Date | null
    onSelectDate: (date: Date, dateStr: string) => void
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function ratingDotClass(rating: string | null) {
    if (rating === "GOOD") return "bg-emerald-400"
    if (rating === "MID") return "bg-amber-400"
    if (rating === "BAD") return "bg-rose-400"
    return "bg-primary"
}

function ratingRingClass(rating: string | null) {
    if (rating === "GOOD") return "ring-emerald-400/40"
    if (rating === "MID") return "ring-amber-400/40"
    if (rating === "BAD") return "ring-rose-400/40"
    return "ring-primary/40"
}

export function DiaryCalendar({ entries, selectedDate, onSelectDate }: DiaryCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const entryMap = useMemo(() => {
        const map: Record<string, string | null> = {}
        entries.forEach(e => { map[e.date] = e.rating })
        return map
    }, [entries])

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth))
        const end = endOfWeek(endOfMonth(currentMonth))
        const days: Date[] = []
        let cur = start
        while (cur <= end) {
            days.push(cur)
            cur = addDays(cur, 1)
        }
        return days
    }, [currentMonth])

    return (
        <div className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-md p-5 space-y-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                    className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                </span>
                <button
                    onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                    className="p-1.5 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-1">
                {calendarDays.map(day => {
                    const dateStr = format(day, "yyyy-MM-dd")
                    const hasEntry = dateStr in entryMap
                    const rating = entryMap[dateStr]
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    const inMonth = isSameMonth(day, currentMonth)
                    const todayDate = isToday(day)

                    return (
                        <motion.button
                            key={dateStr}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSelectDate(day, dateStr)}
                            className={cn(
                                "relative flex flex-col items-center justify-center h-9 w-full rounded-xl text-xs transition-all duration-150",
                                !inMonth && "opacity-25 pointer-events-none",
                                isSelected && hasEntry && `bg-card ring-2 ${ratingRingClass(rating)}`,
                                isSelected && !hasEntry && "bg-primary text-primary-foreground",
                                !isSelected && todayDate && "ring-1 ring-primary",
                                !isSelected && "hover:bg-muted/60",
                            )}
                        >
                            <span className={cn(
                                "font-medium leading-none",
                                todayDate && !isSelected && "text-primary",
                                isSelected && !hasEntry && "text-primary-foreground",
                            )}>
                                {format(day, "d")}
                            </span>

                            {/* Entry indicator dot */}
                            {hasEntry && (
                                <span className={cn(
                                    "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                                    ratingDotClass(rating),
                                )} />
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-border/30 flex flex-wrap gap-3 justify-center">
                {[
                    { label: "Good", cls: "bg-emerald-400" },
                    { label: "Mid", cls: "bg-amber-400" },
                    { label: "Bad", cls: "bg-rose-400" },
                    { label: "Entry", cls: "bg-primary" },
                ].map(({ label, cls }) => (
                    <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={cn("w-2 h-2 rounded-full", cls)} />
                        {label}
                    </span>
                ))}
            </div>
        </div>
    )
}
