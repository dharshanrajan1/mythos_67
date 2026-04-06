"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Book, Dumbbell, LayoutDashboard, CalendarDays, LogOut, Library } from "lucide-react"
import { signOut } from "next-auth/react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRef } from "react"
import { ThemeSwitcher } from "@/components/ThemeSwitcher"

const routes = [
    { label: "Home",      href: "/",          icon: Home },
    { label: "Journal",   href: "/diary",      icon: Book },
    { label: "Fitness",   href: "/fitness",    icon: Dumbbell },
    { label: "Mind Dump", href: "/mind-dump",   icon: LayoutDashboard },
    { label: "Planning",  href: "/planning",   icon: CalendarDays },
    { label: "Media",     href: "/media",      icon: Library },
]

function DockItem({
    href,
    label,
    icon: Icon,
    active,
    mouseX,
}: {
    href: string
    label: string
    icon: React.ElementType
    active: boolean
    mouseX: ReturnType<typeof useMotionValue<number>>
}) {
    const ref = useRef<HTMLAnchorElement>(null)

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect()
        if (!bounds) return 999
        return val - (bounds.left + bounds.width / 2)
    })

    const scale = useSpring(
        useTransform(distance, [-120, 0, 120], [1, 1.55, 1]),
        { stiffness: 300, damping: 25 }
    )

    return (
        <Link ref={ref} href={href}>
            <motion.div
                style={{ scale }}
                className={cn(
                    "relative flex flex-col items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-2xl transition-colors duration-200 cursor-pointer group",
                    active
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
            >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />

                {/* Tooltip */}
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium bg-popover text-popover-foreground border border-border shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                    {label}
                </span>

                {/* Active dot */}
                {active && (
                    <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary-foreground/60" />
                )}
            </motion.div>
        </Link>
    )
}

export function Navbar() {
    const pathname = usePathname()
    const mouseX = useMotionValue(Infinity)

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
            <motion.div
                onMouseMove={(e) => mouseX.set(e.clientX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className={cn(
                    "flex items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-2 sm:py-3 rounded-3xl",
                    "border border-border/40",
                    "bg-background/70 backdrop-blur-2xl",
                    "shadow-xl shadow-black/20"
                )}
            >
                {routes.map((route) => (
                    <DockItem
                        key={route.href}
                        href={route.href}
                        label={route.label}
                        icon={route.icon}
                        active={pathname === route.href}
                        mouseX={mouseX}
                    />
                ))}

                {/* Divider */}
                <div className="w-px h-8 bg-border/60 mx-1" />

                {/* Theme switcher */}
                <div className="px-1">
                    <ThemeSwitcher />
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-border/60 mx-1" />

                {/* Logout */}
                <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                    title="Logout"
                >
                    <LogOut className="h-4.5 w-4.5" />
                </motion.button>
            </motion.div>
        </motion.div>
    )
}
