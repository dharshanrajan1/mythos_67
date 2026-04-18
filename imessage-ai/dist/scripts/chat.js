import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { prisma } from "../lib/prisma.js";
import { handleInboundMessage } from "../services/message-router.js";
import { getOrCreateSmsThread } from "../services/users.js";
async function main() {
    const from = process.argv[2] ?? "+15555550123";
    const to = process.argv[3] ?? "+15555550000";
    const rl = createInterface({ input, output });
    let thread = await getOrCreateSmsThread(from);
    output.write(`Simulated SMS chat ready for ${from}\n`);
    output.write("Commands: /exit, /reset\n\n");
    while (true) {
        const body = (await rl.question("you> ")).trim();
        if (!body) {
            continue;
        }
        if (body === "/exit") {
            break;
        }
        if (body === "/reset") {
            await resetUserData(thread.userId);
            thread = await getOrCreateSmsThread(from);
            output.write("system> conversation state reset for this simulated user\n\n");
            continue;
        }
        const inbound = await prisma.message.create({
            data: {
                threadId: thread.id,
                direction: "INBOUND",
                provider: "simulator-cli",
                providerMessageId: `cli_${Date.now()}`,
                bodyText: body,
                mediaCount: 0,
                rawPayload: {
                    from,
                    to,
                    body,
                    simulated: true,
                },
            },
        });
        const outcome = await handleInboundMessage({
            userId: thread.userId,
            threadId: thread.id,
            messageId: inbound.id,
            text: body,
            mediaCount: 0,
        });
        await prisma.message.create({
            data: {
                threadId: thread.id,
                direction: "OUTBOUND",
                provider: "simulator-cli",
                bodyText: outcome.replyText,
                rawPayload: {
                    to: from,
                    from: to,
                    simulated: true,
                },
            },
        });
        output.write(`agent> ${outcome.replyText}\n\n`);
    }
    await rl.close();
    await prisma.$disconnect();
}
async function resetUserData(userId) {
    await prisma.$transaction([
        prisma.correction.deleteMany({ where: { userId } }),
        prisma.dailyRollup.deleteMany({ where: { userId } }),
        prisma.clarification.deleteMany({
            where: {
                mealEvent: {
                    userId,
                },
            },
        }),
        prisma.mealItem.deleteMany({
            where: {
                mealEvent: {
                    userId,
                },
            },
        }),
        prisma.mealEvent.deleteMany({ where: { userId } }),
        prisma.message.deleteMany({
            where: {
                thread: {
                    userId,
                },
            },
        }),
        prisma.thread.deleteMany({ where: { userId } }),
        prisma.goal.deleteMany({ where: { userId } }),
        prisma.profile.deleteMany({ where: { userId } }),
        prisma.coachMemory.deleteMany({ where: { userId } }),
        prisma.onboardingSession.deleteMany({ where: { userId } }),
        prisma.user.deleteMany({ where: { id: userId } }),
    ]);
}
main().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
