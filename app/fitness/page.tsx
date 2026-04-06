"use client"

import { useState } from "react"
import { WeightTracker } from "@/components/fitness/WeightTracker"
import { WorkoutTracker } from "@/components/fitness/WorkoutTracker"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, Dumbbell, TrendingDown, CalendarCheck } from "lucide-react"
import { format, startOfWeek } from "date-fns"

interface WeightLog {
    id: string
    weight: number
    date: string
    fullDate: string
}

interface WorkoutLog {
    id: string
    workout: string
    date: string
}

const TABS = ["Weight", "Workouts"] as const
type Tab = (typeof TABS)[number]

export default function FitnessPage() {
    const [activeTab, setActiveTab] = useState<Tab>("Weight")
    const [weightData, setWeightData] = useState<WeightLog[]>([])
    const [workoutData, setWorkoutData] = useState<WorkoutLog[]>([])

    const latestWeight = weightData.length ? weightData[weightData.length - 1].weight : null
    const prevWeight = weightData.length > 1 ? weightData[weightData.length - 2].weight : null
    const weightDelta = latestWeight != null && prevWeight != null ? latestWeight - prevWeight : null

    const totalWorkouts = workoutData.length

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const loggedDates = workoutData.map(l => format(new Date(l.date), 'yyyy-MM-dd'))
    const thisWeekWorkouts = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        return format(d, 'yyyy-MM-dd')
    }).filter(d => loggedDates.includes(d)).length

    const stats = [
        {
            icon: Scale,
            label: "Current Weight",
            value: latestWeight ? `${latestWeight} lbs` : "—",
            sub: weightDelta != null
                ? weightDelta < 0 ? `↓ ${Math.abs(weightDelta).toFixed(1)} from last` : weightDelta > 0 ? `↑ ${weightDelta.toFixed(1)} from last` : "No change"
                : "No data yet",
            subColor: weightDelta != null ? (weightDelta < 0 ? "text-emerald-500" : weightDelta > 0 ? "text-rose-500" : "text-muted-foreground") : "text-muted-foreground",
        },
        {
            icon: TrendingDown,
            label: "Weight Change",
            value: weightDelta != null ? `${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} lbs` : "—",
            sub: "Since last log",
            subColor: "text-muted-foreground",
        },
        {
            icon: Dumbbell,
            label: "Total Workouts",
            value: totalWorkouts > 0 ? `${totalWorkouts}` : "—",
            sub: "All time",
            subColor: "text-muted-foreground",
        },
        {
            icon: CalendarCheck,
            label: "This Week",
            value: `${thisWeekWorkouts} / 7`,
            sub: "Days active",
            subColor: "text-muted-foreground",
        },
    ]

    return (
        <div className="space-y-5 md:space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fitness Tracker</h1>
                <p className="text-muted-foreground">Track your weight and workouts over time.</p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(({ icon: Icon, label, value, sub, subColor }) => (
                    <Card key={label} className="glass-card">
                        <CardContent className="pt-5 pb-4 px-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-muted-foreground font-medium">{label}</p>
                                <div className="p-1.5 rounded-lg bg-primary/10">
                                    <Icon className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{value}</p>
                            <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tabs */}
            <div>
                <div className="flex gap-1 p-1 bg-muted/40 rounded-xl w-fit mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${activeTab === tab
                                    ? "bg-card shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <Card className="glass-card">
                    <CardContent className="pt-6">
                        {activeTab === "Weight" && (
                            <WeightTracker onDataChange={setWeightData} />
                        )}
                        {activeTab === "Workouts" && (
                            <WorkoutTracker onDataChange={setWorkoutData} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
