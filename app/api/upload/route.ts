import { NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File
    const caption = formData.get("caption") as string

    if (!file) {
        return new NextResponse("No file uploaded", { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + "_" + file.name.replaceAll(" ", "_")

    // Save to public/uploads
    const uploadDir = path.join(process.cwd(), "public/uploads")
    // Ensure dir exists (might need mkdir)
    // For now assuming public exists, uploads might not
    try {
        await writeFile(path.join(uploadDir, filename), buffer)
    } catch (e) {
        // Try creating dir
        const fs = require('fs')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
            await writeFile(path.join(uploadDir, filename), buffer)
        }
    }

    try {
        const photo = await prisma.progressPhoto.create({
            data: {
                userId: session.user.id,
                url: `/uploads/${filename}`,
                caption,
                date: new Date(),
            },
        })
        return NextResponse.json(photo)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return new NextResponse("Unauthorized", { status: 401 })

    try {
        const photos = await prisma.progressPhoto.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'desc' },
        })
        return NextResponse.json(photos)
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
        const photo = await prisma.progressPhoto.findUnique({
            where: { id, userId: session.user.id }
        })

        if (!photo) return new NextResponse("Not found", { status: 404 })

        // Delete from DB
        await prisma.progressPhoto.delete({
            where: { id }
        })

        // Try to delete file
        try {
            const fs = require('fs')
            const filePath = path.join(process.cwd(), "public", photo.url)
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        } catch (e) {
            console.error("Failed to delete file", e)
        }

        return new NextResponse("Deleted", { status: 200 })
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
