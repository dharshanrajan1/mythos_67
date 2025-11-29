"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { AnimatePresence, motion } from "framer-motion"

export function WorkoutTracker() {
    const [workout, setWorkout] = useState("")
    const [data, setData] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchData = async () => {
        try {
            const res = await fetch("/api/fitness/workout")
            if (res.ok) {
                const logs = await res.json()
                setData(logs)
            } else {
                if (res.status === 401) setError("Please login to save data")
            }
        } catch (error) {
            console.error("Failed to fetch workout logs", error)
            setError("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!workout) return
        setError("")

        try {
            const res = await fetch("/api/fitness/workout", {
                method: "POST",
                body: JSON.stringify({ workout, date: new Date() }),
                headers: { "Content-Type": "application/json" },
            })
            if (!res.ok) {
                if (res.status === 401) setError("Please login to save data")
                else setError("Failed to save")
                return
            }
            setWorkout("")
            fetchData()
        } catch (error) {
            console.error("Failed to save workout", error)
            setError("Failed to save")
        }
    }

    const deleteLog = async (id: string) => {
        try {
            const res = await fetch(`/api/fitness/workout?id=${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                fetchData()
            } else {
                setError("Failed to delete log")
            }
        } catch (error) {
            console.error("Failed to delete log", error)
            setError("Failed to delete log")
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <label htmlFor="workout" className="text-sm font-medium">Log Workout</label>
                    <Input
                        id="workout"
                        value={workout}
                        onChange={(e) => setWorkout(e.target.value)}
                        placeholder="e.g. Leg Day - Squats, Lunges..."
                    />
                </div>
                <Button type="submit">Add Log</Button>
            </form>
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="space-y-2">
                <h3 className="text-lg font-semibold">Recent Workouts</h3>
                {isLoading ? (
                    <div>Loading...</div>
                ) : data.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        <AnimatePresence mode="popLayout">
                            {data.map((log: any) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="flex items-center justify-between p-3 border rounded-md bg-card/50 backdrop-blur-sm"
                                >
                                    <div>
                                        <p className="font-medium">{log.workout}</p>
                                        <p className="text-muted-foreground text-sm">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => deleteLog(log.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        Delete
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-muted-foreground">No workouts logged yet</div>
                )}
            </div>
        </div>
    )
}
