"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Task, Priority, PRIORITY_CONFIG } from "./KanbanBoard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash, GripVertical, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface KanbanCardProps {
    task: Task
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: string) => void
    onPriorityChange: (id: string, priority: string) => void
    onNotesChange?: (id: string, notes: string) => void
}

const PRIORITY_ORDER: Priority[] = ['HIGH', 'MEDIUM', 'LOW']

export function KanbanCard({ task, onDelete, onStatusChange, onPriorityChange, onNotesChange }: KanbanCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)
    const [notes, setNotes] = useState(task.notes || "")

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: { type: "Task", task },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-secondary/50 rounded-lg border-2 border-primary/20 h-[90px]"
            />
        )
    }

    const priority = (task.priority || 'MEDIUM') as Priority
    const priorityCfg = PRIORITY_CONFIG[priority]

    const cyclePriority = (e: React.MouseEvent) => {
        e.stopPropagation()
        const next = PRIORITY_ORDER[(PRIORITY_ORDER.indexOf(priority) + 1) % PRIORITY_ORDER.length]
        onPriorityChange(task.id, next)
    }

    const handleNotesBlur = () => {
        if (notes !== task.notes) {
            onNotesChange?.(task.id, notes)
        }
    }

    return (
        <div ref={setNodeRef} style={{ ...style, minHeight: '90px' }} className="group relative perspective-1000">
            <div
                className={cn(
                    "relative w-full h-full transition-all duration-500 preserve-3d",
                    isFlipped ? "rotate-y-180" : ""
                )}
                style={{ minHeight: '90px' }}
            >
                {/* Front Side */}
                <div className={cn("absolute inset-0 backface-hidden", !isFlipped ? "z-10" : "z-0")}>
                    <Card
                        className={cn(
                            "bg-secondary/30 border-white/5 backdrop-blur-sm hover:bg-secondary/50 transition-colors h-full",
                            task.status === 'COMPLETED' && "opacity-60"
                        )}
                        onDoubleClick={() => setIsFlipped(true)}
                    >
                        <CardContent className="p-2.5 flex flex-col gap-2 h-full">
                            {/* Top row: grip + content + delete */}
                            <div className="flex items-start gap-1.5">
                                <div
                                    {...attributes}
                                    {...listeners}
                                    className="mt-0.5 text-muted-foreground/40 hover:text-foreground cursor-grab active:cursor-grabbing shrink-0"
                                >
                                    <GripVertical className="h-3.5 w-3.5" />
                                </div>

                                <p className={cn(
                                    "flex-1 text-xs font-medium leading-snug line-clamp-3",
                                    task.status === 'COMPLETED' && "line-through text-muted-foreground"
                                )}>
                                    {task.content}
                                </p>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-0.5 -mr-0.5"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete(task.id)
                                    }}
                                >
                                    <Trash className="h-3 w-3" />
                                </Button>
                            </div>

                            {/* Bottom row: complete + priority */}
                            <div className="flex items-center gap-1.5 mt-auto">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onStatusChange(task.id, task.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED')
                                    }}
                                    className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full border transition-colors flex items-center gap-1 flex-1",
                                        task.status === 'COMPLETED'
                                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                                            : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
                                    )}
                                >
                                    <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                                    <span className="truncate">{task.status === 'COMPLETED' ? 'Done' : 'Complete'}</span>
                                </button>

                                <button
                                    onClick={cyclePriority}
                                    title={`Priority: ${priorityCfg.label} — click to cycle`}
                                    className={cn(
                                        "text-[10px] px-1.5 py-0.5 rounded-full border transition-colors shrink-0",
                                        priorityCfg.badgeClass
                                    )}
                                >
                                    {priorityCfg.label}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Back Side (Notes) */}
                <div className={cn("absolute inset-0 backface-hidden rotate-y-180", isFlipped ? "z-10" : "z-0")}>
                    <Card
                        className="bg-secondary/30 border-white/5 backdrop-blur-sm h-full overflow-hidden"
                        onDoubleClick={() => setIsFlipped(false)}
                    >
                        <CardContent className="p-2 h-full flex flex-col">
                            <textarea
                                className="w-full h-full bg-transparent border-none resize-none text-[11px] text-muted-foreground focus:outline-none p-1"
                                placeholder="Notes... (double-click to flip back)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                onBlur={handleNotesBlur}
                                autoFocus
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
