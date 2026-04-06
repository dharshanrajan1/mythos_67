"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, BookOpen, Dumbbell, Scale, Lightbulb, Link2 } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

export type ActivityType = "task" | "diary" | "workout" | "weight" | "note"

export interface ActivityItem {
    id: string
    type: ActivityType
    label: string
    sub: string
    timestamp: string
}

const TYPE_CONFIG: Record<ActivityType, { icon: React.ElementType; color: string }> = {
    task:    { icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-500" },
    diary:   { icon: BookOpen,     color: "bg-violet-500/10 text-violet-500" },
    workout: { icon: Dumbbell,     color: "bg-sky-500/10 text-sky-500" },
    weight:  { icon: Scale,        color: "bg-rose-500/10 text-rose-500" },
    note:    { icon: Lightbulb,    color: "bg-amber-500/10 text-amber-500" },
}

export function UnifiedActivityFeed({ items }: { items: ActivityItem[] }) {
    if (items.length === 0) {
        return <div className="text-sm text-muted-foreground">No recent activity to show.</div>
    }

    return (
        <div className="space-y-3">
            <AnimatePresence>
                {items.map((item, index) => {
                    const { icon: Icon, color } = TYPE_CONFIG[item.type]
                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.06 }}
                            className="flex items-start gap-3"
                        >
                            <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${color}`}>
                                <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium leading-snug truncate">{item.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.sub} · {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</p>
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
