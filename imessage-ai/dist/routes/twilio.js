import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { fetchAndStoreInboundMedia } from "../lib/storage.js";
import { sendSms } from "../lib/twilio.js";
import { getOrCreateSmsThread } from "../services/users.js";
import { handleInboundMessage } from "../services/message-router.js";
const twilioInboundSchema = z.object({
    MessageSid: z.string(),
    From: z.string(),
    To: z.string(),
    Body: z.string().optional().default(""),
    NumMedia: z.coerce.number().default(0),
});
export async function registerTwilioRoutes(app) {
    app.post("/inbound", async (request, reply) => {
        const parsed = twilioInboundSchema.safeParse(request.body);
        if (!parsed.success) {
            request.log.warn({ issues: parsed.error.issues }, "Invalid Twilio payload");
            return reply.badRequest("Invalid payload");
        }
        const payload = request.body;
        const inbound = parsed.data;
        const thread = await getOrCreateSmsThread(inbound.From);
        const message = await prisma.message.create({
            data: {
                threadId: thread.id,
                direction: "INBOUND",
                provider: "twilio",
                providerMessageId: inbound.MessageSid,
                bodyText: inbound.Body,
                mediaCount: inbound.NumMedia,
                rawPayload: payload,
            },
        });
        if (inbound.NumMedia > 0) {
            await fetchAndStoreInboundMedia({
                messageId: message.id,
                mediaCount: inbound.NumMedia,
                payload,
            });
        }
        const outcome = await handleInboundMessage({
            userId: thread.userId,
            threadId: thread.id,
            messageId: message.id,
            text: inbound.Body,
            mediaCount: inbound.NumMedia,
        });
        const outbound = await sendSms({
            to: inbound.From,
            body: outcome.replyText,
        });
        await prisma.message.create({
            data: {
                threadId: thread.id,
                direction: "OUTBOUND",
                provider: "twilio",
                providerMessageId: outbound.providerMessageId,
                bodyText: outcome.replyText,
                rawPayload: outbound.rawPayload,
            },
        });
        return reply.code(200).type("text/plain").send("OK");
    });
}
