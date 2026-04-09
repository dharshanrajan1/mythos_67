import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Meridian",
        short_name: "Meridian",
        description: "Your personal life OS — journal, fitness, planning, and more.",
        start_url: "/",
        display: "standalone",
        background_color: "#0b0f1a",
        theme_color: "#7c3aed",
        orientation: "portrait",
        icons: [
            {
                src: "/icon",
                sizes: "32x32",
                type: "image/png",
            },
            {
                src: "/icon",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/apple-icon",
                sizes: "180x180",
                type: "image/png",
            },
        ],
        shortcuts: [
            {
                name: "New Task",
                short_name: "Task",
                description: "Add a new task to your plan",
                url: "/planning",
                icons: [{ src: "/apple-icon", sizes: "192x192" }],
            },
            {
                name: "Quick Dump",
                short_name: "Dump",
                description: "Drop a link or idea",
                url: "/mind-dump",
                icons: [{ src: "/apple-icon", sizes: "192x192" }],
            },
            {
                name: "Log Workout",
                short_name: "Workout",
                description: "Log your daily workout",
                url: "/fitness",
                icons: [{ src: "/apple-icon", sizes: "192x192" }],
            },
        ]
    }
}
