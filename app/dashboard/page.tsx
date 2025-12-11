"use client"

import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default function DashboardPage() {
    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden">
            <DashboardGrid />
        </div>
    );
}
