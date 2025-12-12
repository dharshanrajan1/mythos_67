import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { google } from "googleapis"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session || !session.accessToken) {
        return NextResponse.json({ events: [], error: "Not authenticated with Google" })
    }

    try {
        const oauth2Client = new google.auth.OAuth2()
        // @ts-ignore
        oauth2Client.setCredentials({ access_token: session.accessToken })

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        // Get limits for today
        const now = new Date()
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString()
        const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString()

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startOfDay,
            timeMax: endOfDay,
            singleEvents: true,
            orderBy: 'startTime',
        })

        const events = response.data.items || []

        // Simplify event data
        const simplifiedEvents = events.map(event => ({
            id: event.id,
            summary: event.summary,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            // Determine if all day
            isAllDay: !event.start?.dateTime
        }))

        return NextResponse.json({ events: simplifiedEvents })
    } catch (error) {
        console.error("Google Calendar API Error:", error)
        return NextResponse.json({ events: [], error: "Failed to fetch events" })
    }
}
