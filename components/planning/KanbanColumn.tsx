"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Task } from "./KanbanBoard"
import { KanbanCard } from "./KanbanCard"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
    day: string
    tasks: Task[]
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: string) => void
    onNotesChange: (id: string, notes: string) => void
}

export function KanbanColumn({ day, tasks, onDelete, onStatusChange, onNotesChange }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: day,
    })

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-lg text-primary/80 border-b border-white/10 pb-1 flex items-center justify-between">
                {day}
                <span className="text-xs text-muted-foreground font-normal">{tasks.length} tasks</span>
            </h3>

            <div ref={setNodeRef} className={cn("space-y-2 min-h-[100px] rounded-lg transition-colors", tasks.length === 0 && "bg-white/5")}>
                <SortableContext
                    id={day}
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length === 0 && (
                        <div className="h-full min-h-[100px] flex items-center justify-center text-xs text-muted-foreground">
                            Drop tasks here
                        </div>
                    )}
                    {tasks.map(task => (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            onDelete={onDelete}
                            onStatusChange={onStatusChange}
                            onNotesChange={onNotesChange}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
