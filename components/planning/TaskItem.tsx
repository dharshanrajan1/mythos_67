import { Task, Priority, PRIORITY_CONFIG } from "./KanbanBoard"
import { Trash, CheckCircle2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const PRIORITY_ORDER: Priority[] = ['HIGH', 'MEDIUM', 'LOW']

interface TaskItemProps {
    task: Task
    weekDateLabels?: Record<string, string>
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: string) => void
    onPriorityChange: (id: string, priority: string) => void
    onUpdateDay: (id: string, day: string) => void
}

export function TaskItem({ task, weekDateLabels, onDelete, onStatusChange, onPriorityChange, onUpdateDay }: TaskItemProps) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const priority = (task.priority || 'MEDIUM') as Priority
    const priorityCfg = PRIORITY_CONFIG[priority]

    const cyclePriority = () => {
        const next = PRIORITY_ORDER[(PRIORITY_ORDER.indexOf(priority) + 1) % PRIORITY_ORDER.length]
        onPriorityChange(task.id, next)
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
            <button
                onClick={() => onStatusChange(task.id, task.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED')}
                className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center transition-all shrink-0",
                    task.status === 'COMPLETED' ? 'bg-green-500 border-green-500 text-white' : 'border-zinc-500 hover:border-black dark:hover:border-white'
                )}
            >
                {task.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
            </button>

            {/* Priority dot */}
            <button
                onClick={cyclePriority}
                title={`Priority: ${priorityCfg.label} — tap to cycle`}
                className="shrink-0"
            >
                <span className={cn("block h-2.5 w-2.5 rounded-full", priorityCfg.dotClass)} />
            </button>

            <span className={cn(
                "flex-1 text-sm transition-colors",
                task.status === 'COMPLETED' ? 'text-muted-foreground line-through' : 'text-foreground'
            )}>
                {task.content}
            </span>

            <div className="flex items-center gap-1">
                <Select value={task.day} onValueChange={(val) => onUpdateDay(task.id, val)}>
                    <SelectTrigger className="h-8 w-8 p-0 border-0 bg-transparent hover:bg-black/10 dark:hover:bg-white/10 focus:ring-0">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                    </SelectTrigger>
                    <SelectContent>
                        {days.map(d => (
                            <SelectItem key={d} value={d}>
                                {weekDateLabels ? `${d} · ${weekDateLabels[d]}` : d}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <button
                    onClick={() => onDelete(task.id)}
                    className="text-zinc-500 hover:text-red-500 dark:hover:text-red-400 p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full"
                >
                    <Trash className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
