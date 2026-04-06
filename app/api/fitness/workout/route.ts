import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const body = await req.json()
        const { workout, date, isPR } = body

        const log = await prisma.workoutLog.create({
            data: {
                userId: session.user.id,
                workout,
                date: new Date(date),
                isPR: isPR ?? false,
            },
        })

        return NextResponse.json(log)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const logs = await prisma.workoutLog.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                date: 'desc',
            },
            take: 30, // Last 30 entries
        })

        return NextResponse.json(logs)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const body = await req.json()
        const { id, isPR } = body

        const log = await prisma.workoutLog.update({
            where: { id, userId: session.user.id },
            data: { isPR },
        })
        return NextResponse.json(log)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return new NextResponse("ID required", { status: 400 })

    try {
        await prisma.workoutLog.delete({
            where: {
                id,
                userId: session.user.id,
            },
        })
        return new NextResponse("Deleted", { status: 200 })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
