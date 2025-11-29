"use client"

import { useDroppable } from "@dnd-kit/core"
import { Task } from "./KanbanBoard"
import { KanbanCard } from "./KanbanCard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface KanbanColumnProps {
    id: string
    title: string
    tasks: Task[]
    onDeleteTask: (id: string) => void
    onStatusChange: (id: string, status: string) => void
}

export function KanbanColumn({ id, title, tasks, onDeleteTask, onStatusChange }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <Card className="h-full flex flex-col min-w-[250px] bg-secondary/30 border-white/5 backdrop-blur-sm">
            <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    {title} <span className="px-2 py-0.5 rounded-full text-xs bg-background/50 text-foreground">{tasks.length}</span>
                </CardTitle>
            </CardHeader>
            <CardContent ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto">
                {tasks.map((task) => (
                    <KanbanCard key={task.id} task={task} onDelete={onDeleteTask} onStatusChange={onStatusChange} />
                ))}
                {tasks.length === 0 && (
                    <div className="h-20 flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed rounded-md">
                        Drop here
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
