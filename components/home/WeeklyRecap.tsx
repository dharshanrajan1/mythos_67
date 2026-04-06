import { CheckCircle2, Dumbbell, BookOpen, TrendingUp } from "lucide-react"

export interface WeeklyRecapData {
    weekLabel: string
    tasksCompleted: number
    tasksTotal: number
    workouts: number
    journalEntries: number
    weightDelta: number | null
}

export function WeeklyRecap({ data }: { data: WeeklyRecapData }) {
    const { weekLabel, tasksCompleted, tasksTotal, workouts, journalEntries, weightDelta } = data
    const hasActivity = tasksTotal > 0 || workouts > 0 || journalEntries > 0

    if (!hasActivity) return null

    const completionPct = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0

    return (
        <div className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-md px-5 py-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Week · {weekLabel}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Tasks */}
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{tasksCompleted}<span className="text-muted-foreground font-normal">/{tasksTotal}</span></p>
                        <p className="text-xs text-muted-foreground">Tasks · {completionPct}%</p>
                    </div>
                </div>

                {/* Workouts */}
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-sky-500/10 shrink-0">
                        <Dumbbell className="h-3.5 w-3.5 text-sky-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{workouts}</p>
                        <p className="text-xs text-muted-foreground">Workouts</p>
                    </div>
                </div>

                {/* Journal */}
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-violet-500/10 shrink-0">
                        <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{journalEntries}</p>
                        <p className="text-xs text-muted-foreground">Journal entries</p>
                    </div>
                </div>

                {/* Weight delta */}
                {weightDelta !== null && (
                    <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg shrink-0 ${weightDelta < 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                            <TrendingUp className={`h-3.5 w-3.5 ${weightDelta < 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)} lbs
                            </p>
                            <p className="text-xs text-muted-foreground">Weight change</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Task progress bar */}
            {tasksTotal > 0 && (
                <div className="mt-3 h-1 bg-muted/40 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${completionPct}%` }}
                    />
                </div>
            )}
        </div>
    )
}
