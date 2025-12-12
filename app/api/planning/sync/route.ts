import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { google } from "googleapis"
import { prisma } from "@/lib/prisma"
import { addDays, startOfWeek, getDay } from "date-fns"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Not authenticated with Google" }, { status: 401 })
    }

    try {
        const { taskId, day, content } = await req.json()

        // 1. Calculate the date for the task
        // Logic: specific day of *this* week (Monday-based start)
        // Note: date-fns startOfWeek defaults to Sunday (0) unless specified
        const now = new Date()
        const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }) // Monday

        const daysMap: Record<string, number> = {
            "Monday": 0,
            "Tuesday": 1,
            "Wednesday": 2,
            "Thursday": 3,
            "Friday": 4,
            "Saturday": 5,
            "Sunday": 6
        }

        const dayOffset = daysMap[day]
        if (dayOffset === undefined) {
            return NextResponse.json({ message: "Invalid day, skipping sync" })
        }

        const taskDate = addDays(startOfCurrentWeek, dayOffset)
        const dateString = taskDate.toISOString().split('T')[0] // YYYY-MM-DD

        // 2. Add to Google Calendar
        // @ts-ignore
        const oauth2Client = new google.auth.OAuth2()
        // @ts-ignore
        oauth2Client.setCredentials({ access_token: session.accessToken })
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        const event = {
            summary: content,
            description: `Task from Weekly Planner (ID: ${taskId})`,
            start: { date: dateString },
            end: { date: dateString },
        }

        const res = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        })

        return NextResponse.json({
            success: true,
            eventId: res.data.id,
            syncedDate: dateString
        })

    } catch (error) {
        console.error("Calendar Sync Error:", error)
        return NextResponse.json({ error: "Failed to sync" }, { status: 500 })
    }
}
