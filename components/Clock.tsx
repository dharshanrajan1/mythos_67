"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

export function Clock() {
    const [time, setTime] = useState(new Date())
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    if (!mounted) {
        return <div className="h-[52px] sm:h-[72px] md:h-[96px]" /> // Placeholder with same height
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="font-mono text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                {format(time, "hh:mm:ss a")}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
                {format(time, "EEEE, MMMM d, yyyy")}
            </p>
        </div>
    )
}
