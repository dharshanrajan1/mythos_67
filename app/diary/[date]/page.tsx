import { DiaryEditor } from "@/components/diary/DiaryEditor"
import { format, parseISO, addDays } from "date-fns"

export default async function DiaryEntryPage({
    params,
}: {
    params: Promise<{ date: string }>
}) {
    const { date } = await params
    // parseISO is safer for "yyyy-MM-dd" strings — avoids timezone offset shifting the day
    const dateObj = addDays(parseISO(date), 0)
    const formattedDate = format(dateObj, "EEEE, MMMM do, yyyy")

    return (
        <div className="relative py-6">
            {/* Page-specific warm background accent */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-40"
                    style={{
                        background: `
                            radial-gradient(ellipse 70% 50% at 10% 20%, hsla(25,80%,60%,0.15) 0%, transparent 60%),
                            radial-gradient(ellipse 60% 40% at 90% 70%, hsla(170,70%,45%,0.12) 0%, transparent 55%)
                        `,
                    }}
                />
            </div>

            <div className="space-y-5 max-w-3xl mx-auto">
                {/* Date header */}
                <div className="flex items-baseline gap-3">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">{formattedDate}</h1>
                </div>

                <DiaryEditor date={date} />
            </div>
        </div>
    )
}
