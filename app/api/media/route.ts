import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const items = await prisma.mediaItem.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(items)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { title, type, status, rating, notes } = await req.json()
    if (!title || !type) return new NextResponse("Missing fields", { status: 400 })

    const item = await prisma.mediaItem.create({
        data: {
            title,
            type,
            status: status ?? "WANT_TO",
            rating: rating ?? null,
            notes: notes ?? null,
            userId: session.user.id,
        },
    })
    return NextResponse.json(item)
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { id, ...updates } = await req.json()
    if (!id) return new NextResponse("Missing id", { status: 400 })

    const item = await prisma.mediaItem.updateMany({
        where: { id, userId: session.user.id },
        data: updates,
    })
    return NextResponse.json(item)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return new NextResponse("Missing id", { status: 400 })

    await prisma.mediaItem.deleteMany({
        where: { id, userId: session.user.id },
    })
    return new NextResponse(null, { status: 204 })
}
