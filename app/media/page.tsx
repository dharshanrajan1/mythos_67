"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Library, Plus, X, Star, ChevronDown, BookOpen, Film, Tv } from "lucide-react"

type MediaType   = "ALL" | "BOOK" | "MOVIE" | "TV_SHOW"
type MediaStatus = "WANT_TO" | "IN_PROGRESS" | "DONE"

interface MediaItem {
    id: string
    title: string
    type: "BOOK" | "MOVIE" | "TV_SHOW"
    status: MediaStatus
    rating: number | null
    notes: string | null
    createdAt: string
}

const TYPE_CONFIG = {
    BOOK:    { label: "Book",    icon: BookOpen, color: "text-violet-500",  bg: "bg-violet-500/10" },
    MOVIE:   { label: "Movie",   icon: Film,     color: "text-blue-500",    bg: "bg-blue-500/10"   },
    TV_SHOW: { label: "TV Show", icon: Tv,       color: "text-rose-500",    bg: "bg-rose-500/10"   },
}

const STATUS_CONFIG = {
    WANT_TO:     { label: "Want to",    pill: "bg-slate-500/15 text-slate-400"    },
    IN_PROGRESS: { label: "In Progress", pill: "bg-amber-500/15 text-amber-500"  },
    DONE:        { label: "Done",        pill: "bg-emerald-500/15 text-emerald-500" },
}

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
    const [hovered, setHovered] = useState<number | null>(null)
    const active = hovered ?? value ?? 0
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(value === n ? null : n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(null)}
                    className="text-amber-400 transition-transform hover:scale-110"
                >
                    <Star className={cn("h-4 w-4", n <= active ? "fill-amber-400" : "fill-none stroke-amber-400/40")} />
                </button>
            ))}
        </div>
    )
}

function AddItemModal({ onClose, onAdd }: { onClose: () => void; onAdd: (item: MediaItem) => void }) {
    const [title, setTitle]   = useState("")
    const [type, setType]     = useState<"BOOK" | "MOVIE" | "TV_SHOW">("BOOK")
    const [status, setStatus] = useState<MediaStatus>("WANT_TO")
    const [rating, setRating] = useState<number | null>(null)
    const [notes, setNotes]   = useState("")
    const [saving, setSaving] = useState(false)

    const handleSubmit = async () => {
        if (!title.trim()) return
        setSaving(true)
        try {
            const res = await fetch("/api/media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), type, status, rating, notes: notes.trim() || null }),
            })
            const created = await res.json()
            onAdd(created)
            onClose()
        } finally {
            setSaving(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-card border border-border/40 shadow-2xl p-5 space-y-4"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">Add to tracker</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <input
                    autoFocus
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="Title…"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted/60 border border-border/40 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground/60"
                />

                {/* Type picker */}
                <div className="flex gap-2">
                    {(["BOOK", "MOVIE", "TV_SHOW"] as const).map(t => {
                        const cfg = TYPE_CONFIG[t]
                        const Icon = cfg.icon
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all",
                                    type === t
                                        ? `${cfg.bg} ${cfg.color} border-current/30`
                                        : "border-border/30 text-muted-foreground hover:border-border/60"
                                )}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {cfg.label}
                            </button>
                        )
                    })}
                </div>

                {/* Status picker */}
                <div className="flex gap-2">
                    {(["WANT_TO", "IN_PROGRESS", "DONE"] as const).map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatus(s)}
                            className={cn(
                                "flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                                status === s
                                    ? `${STATUS_CONFIG[s].pill} border-current/20`
                                    : "border-border/30 text-muted-foreground hover:border-border/60"
                            )}
                        >
                            {STATUS_CONFIG[s].label}
                        </button>
                    ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Rating</span>
                    <StarRating value={rating} onChange={setRating} />
                    {rating && <span className="text-xs text-muted-foreground">{rating}/5</span>}
                </div>

                {/* Notes */}
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Notes (optional)…"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border/40 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground/60 resize-none"
                />

                <button
                    onClick={handleSubmit}
                    disabled={saving || !title.trim()}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-opacity"
                >
                    {saving ? "Adding…" : "Add"}
                </button>
            </motion.div>
        </motion.div>
    )
}

function MediaCard({ item, onDelete, onStatusChange, onRatingChange }: {
    item: MediaItem
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: MediaStatus) => void
    onRatingChange: (id: string, rating: number | null) => void
}) {
    const typeCfg = TYPE_CONFIG[item.type]
    const TypeIcon = typeCfg.icon
    const [expanded, setExpanded] = useState(false)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-md p-4 group"
        >
            <div className="flex items-start gap-3">
                <div className={cn("shrink-0 p-2 rounded-xl", typeCfg.bg)}>
                    <TypeIcon className={cn("h-4 w-4", typeCfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{item.title}</p>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_CONFIG[item.status].pill)}>
                            {STATUS_CONFIG[item.status].label}
                        </span>
                    </div>
                    {item.rating && (
                        <div className="flex gap-0.5 mt-1">
                            {[1,2,3,4,5].map(n => (
                                <Star key={n} className={cn("h-3 w-3", n <= item.rating! ? "fill-amber-400 text-amber-400" : "fill-none text-amber-400/30")} />
                            ))}
                        </div>
                    )}
                    {item.notes && !expanded && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.notes}</p>
                    )}
                    {item.notes && expanded && (
                        <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {item.notes && (
                        <button onClick={() => setExpanded(v => !v)} className="p-1 rounded-lg hover:bg-muted/60 text-muted-foreground transition-colors">
                            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
                        </button>
                    )}
                    <button onClick={() => onDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-destructive transition-all">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Quick status change row */}
            <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/20">
                {(["WANT_TO", "IN_PROGRESS", "DONE"] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => onStatusChange(item.id, s)}
                        className={cn(
                            "flex-1 py-1 rounded-lg text-xs font-medium transition-all",
                            item.status === s
                                ? `${STATUS_CONFIG[s].pill}`
                                : "text-muted-foreground hover:bg-muted/60"
                        )}
                    >
                        {STATUS_CONFIG[s].label}
                    </button>
                ))}
                <div className="border-l border-border/20 pl-1.5">
                    <StarRating
                        value={item.rating}
                        onChange={r => onRatingChange(item.id, r)}
                    />
                </div>
            </div>
        </motion.div>
    )
}

export default function MediaPage() {
    const [items, setItems]           = useState<MediaItem[]>([])
    const [loading, setLoading]       = useState(true)
    const [showAdd, setShowAdd]       = useState(false)
    const [typeFilter, setTypeFilter] = useState<MediaType>("ALL")
    const [statusFilter, setStatusFilter] = useState<MediaStatus | "ALL">("ALL")

    useEffect(() => {
        fetch("/api/media")
            .then(r => r.json())
            .then(data => { setItems(data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const handleAdd = (item: MediaItem) => {
        setItems(prev => [item, ...prev])
    }

    const handleDelete = async (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id))
        await fetch(`/api/media?id=${id}`, { method: "DELETE" })
    }

    const handleStatusChange = async (id: string, status: MediaStatus) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
        await fetch("/api/media", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        })
    }

    const handleRatingChange = async (id: string, rating: number | null) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, rating } : i))
        await fetch("/api/media", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, rating }),
        })
    }

    const filtered = items.filter(i => {
        const matchType   = typeFilter === "ALL"   || i.type === typeFilter
        const matchStatus = statusFilter === "ALL" || i.status === statusFilter
        return matchType && matchStatus
    })

    const counts = {
        BOOK:    items.filter(i => i.type === "BOOK").length,
        MOVIE:   items.filter(i => i.type === "MOVIE").length,
        TV_SHOW: items.filter(i => i.type === "TV_SHOW").length,
    }

    return (
        <div className="relative min-h-full py-6">
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute inset-0 opacity-40" style={{
                    background: `
                        radial-gradient(ellipse 70% 50% at 15% 25%, hsla(260,70%,60%,0.13) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 40% at 85% 75%, hsla(210,80%,55%,0.10) 0%, transparent 55%)
                    `,
                }} />
            </div>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <Library className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Media Tracker</h1>
                            <p className="text-sm text-muted-foreground">
                                {items.length} item{items.length !== 1 ? "s" : ""} tracked
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </motion.button>
                </div>

                {/* Type filter pills */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setTypeFilter("ALL")}
                        className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                            typeFilter === "ALL" ? "bg-foreground text-background border-foreground" : "border-border/30 text-muted-foreground hover:border-border/60")}
                    >
                        All · {items.length}
                    </button>
                    {(["BOOK", "MOVIE", "TV_SHOW"] as const).map(t => {
                        const cfg = TYPE_CONFIG[t]
                        const Icon = cfg.icon
                        return (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t)}
                                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                                    typeFilter === t ? `${cfg.bg} ${cfg.color} border-current/30` : "border-border/30 text-muted-foreground hover:border-border/60")}
                            >
                                <Icon className="h-3 w-3" />
                                {cfg.label} · {counts[t]}
                            </button>
                        )
                    })}
                </div>

                {/* Status tabs */}
                <div className="flex flex-wrap gap-2">
                    {(["ALL", "WANT_TO", "IN_PROGRESS", "DONE"] as const).map(s => {
                        const label = s === "ALL" ? "All" : STATUS_CONFIG[s].label
                        const cnt   = s === "ALL" ? filtered.length : items.filter(i => i.status === s && (typeFilter === "ALL" || i.type === typeFilter)).length
                        return (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                                    statusFilter === s
                                        ? s === "ALL" ? "bg-foreground text-background border-foreground"
                                          : STATUS_CONFIG[s].pill + " border-current/20"
                                        : "border-border/30 text-muted-foreground hover:border-border/60"
                                )}
                            >
                                {label} {cnt > 0 && <span className="opacity-70">{cnt}</span>}
                            </button>
                        )
                    })}
                </div>

                {/* Items grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-28 rounded-2xl bg-card/50 border border-border/30 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                            <Library className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Nothing here yet</h3>
                        <p className="text-sm text-muted-foreground mb-6">Start tracking the books, movies, and shows in your life.</p>
                        <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
                            Add your first item
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <AnimatePresence>
                            {filtered.map(item => (
                                <MediaCard
                                    key={item.id}
                                    item={item}
                                    onDelete={handleDelete}
                                    onStatusChange={handleStatusChange}
                                    onRatingChange={handleRatingChange}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showAdd && <AddItemModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
            </AnimatePresence>
        </div>
    )
}
