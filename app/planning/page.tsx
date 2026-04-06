"use client"

import { KanbanBoard } from "@/components/planning/KanbanBoard";

export default function PlanningPage() {
    return (
        <div className="pt-2 md:pt-6 space-y-4 md:space-y-8 md:h-full flex flex-col md:overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Weekly Planning</h2>
            </div>
            <KanbanBoard />
        </div>
    );
}
