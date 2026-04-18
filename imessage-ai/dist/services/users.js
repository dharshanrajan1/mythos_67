import { prisma } from "../lib/prisma.js";
export async function getOrCreateSmsThread(phoneE164) {
    const user = await prisma.user.upsert({
        where: { phoneE164 },
        update: {},
        create: {
            phoneE164,
            threads: {
                create: {
                    transport: "SMS",
                },
            },
        },
        include: {
            threads: {
                where: { transport: "SMS" },
                orderBy: { createdAt: "asc" },
                take: 1,
            },
        },
    });
    const existingThread = user.threads[0];
    if (existingThread) {
        return existingThread;
    }
    return prisma.thread.create({
        data: {
            userId: user.id,
            transport: "SMS",
        },
    });
}
