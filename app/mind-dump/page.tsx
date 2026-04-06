"use client"

import { MindDump } from "@/components/mind-dump/MindDump"

export default function MindDumpPage() {
    return (
        <div className="space-y-5 md:space-y-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mind Dump</h1>
                <p className="text-muted-foreground">Capture ideas, links, and videos before they slip away.</p>
            </div>
            <MindDump />
        </div>
    )
}
