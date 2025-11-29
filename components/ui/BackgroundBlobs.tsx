"use client"

import { usePathname } from "next/navigation"

export function BackgroundBlobs() {
    const pathname = usePathname()

    // Default: Blue/Violet (Home)
    let blob1 = "bg-blue-600/20"
    let blob2 = "bg-violet-600/20"
    let blob3 = "bg-indigo-600/20"

    if (pathname?.startsWith("/diary")) {
        // Calm: Teal/Cyan/Blue
        blob1 = "bg-teal-600/20"
        blob2 = "bg-cyan-600/20"
        blob3 = "bg-sky-600/20"
    } else if (pathname?.startsWith("/fitness")) {
        // Energetic: Rose/Orange/Red
        blob1 = "bg-rose-600/20"
        blob2 = "bg-orange-600/20"
        blob3 = "bg-red-600/20"
    } else if (pathname?.startsWith("/planning")) {
        // Focus: Emerald/Teal/Green
        blob1 = "bg-emerald-600/20"
        blob2 = "bg-teal-600/20"
        blob3 = "bg-green-600/20"
    }

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none transition-colors duration-1000 ease-in-out">
            <div className={`absolute top-0 -left-4 w-96 h-96 ${blob1} rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob transition-colors duration-1000`}></div>
            <div className={`absolute top-0 -right-4 w-96 h-96 ${blob2} rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-2000 transition-colors duration-1000`}></div>
            <div className={`absolute -bottom-8 left-20 w-96 h-96 ${blob3} rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-blob animation-delay-4000 transition-colors duration-1000`}></div>
        </div>
    )
}
