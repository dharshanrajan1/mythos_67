import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const countdowns = await prisma.countdown.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "asc" },
    })
    return NextResponse.json(countdowns)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { title, date } = await req.json()
    if (!title || !date) return new NextResponse("Missing fields", { status: 400 })

    const countdown = await prisma.countdown.create({
        data: { title, date: new Date(date), userId: session.user.id },
    })
    return NextResponse.json(countdown)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return new NextResponse("Missing id", { status: 400 })

    await prisma.countdown.deleteMany({
        where: { id, userId: session.user.id },
    })
    return new NextResponse(null, { status: 204 })
}
