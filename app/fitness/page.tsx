"use client"

import { WeightTracker } from "@/components/fitness/WeightTracker"
import { ProgressGallery } from "@/components/fitness/ProgressGallery"
import { WorkoutTracker } from "@/components/fitness/WorkoutTracker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FitnessPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Fitness Tracker</h1>
                <p className="text-muted-foreground">Track your weight, workouts, and progress photos.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Weight Tracker</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <WeightTracker />
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Workout Tracker</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <WorkoutTracker />
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Progress Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProgressGallery />
                </CardContent>
            </Card>
        </div>
    )
}
