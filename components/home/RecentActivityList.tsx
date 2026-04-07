"use client"

import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

interface Task {
    id: string
    content: string
    updatedAt: Date
}

interface RecentActivityListProps {
    tasks: Task[]
}

export function RecentActivityList({ tasks }: RecentActivityListProps) {
    if (tasks.length === 0) {
        return (
            <div className="text-sm text-muted-foreground">
                No recent activity to show.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {tasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 pb-3 border-b border-black/5 dark:border-white/5 last:border-0 last:pb-0"
                    >
                        <div className="mt-1">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{task.content}</p>
                            <p className="text-xs text-muted-foreground">
                                Completed {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
