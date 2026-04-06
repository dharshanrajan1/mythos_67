"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Task } from "./KanbanBoard"
import { KanbanCard } from "./KanbanCard"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
    day: string
    dateLabel?: string
    isToday?: boolean
    tasks: Task[]
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: string) => void
    onPriorityChange: (id: string, priority: string) => void
    onNotesChange: (id: string, notes: string) => void
}

export function KanbanColumn({ day, dateLabel, isToday, tasks, onDelete, onStatusChange, onPriorityChange, onNotesChange }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({ id: day })

    return (
        <div className={cn(
            "flex flex-col rounded-xl p-2 transition-colors",
            isToday
                ? "bg-primary/5 ring-1 ring-primary/20"
                : "bg-white/[0.02] ring-1 ring-white/5"
        )}>
            {/* Column header */}
            <div className={cn(
                "pb-2 mb-2 border-b flex flex-col gap-0.5",
                isToday ? "border-primary/30" : "border-white/10"
            )}>
                <div className="flex items-center justify-between">
                    <span className={cn(
                        "font-semibold text-sm leading-tight",
                        isToday ? "text-primary" : "text-primary/80"
                    )}>
                        {day}
                    </span>
                    {isToday && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium leading-none">
                            Today
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    {dateLabel && (
                        <span className="text-xs text-muted-foreground">{dateLabel}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground/70 ml-auto">
                        {tasks.length > 0 ? `${tasks.length} task${tasks.length === 1 ? '' : 's'}` : ''}
                    </span>
                </div>
            </div>

            {/* Droppable task area */}
            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 space-y-2 min-h-[120px] rounded-lg transition-colors",
                    tasks.length === 0 && "flex items-center justify-center"
                )}
            >
                <SortableContext
                    id={day}
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length === 0 && (
                        <p className="text-[11px] text-muted-foreground/50 text-center select-none">
                            Drop tasks here
                        </p>
                    )}
                    {tasks.map(task => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                            onPriorityChange={onPriorityChange}
                            onNotesChange={onNotesChange}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
