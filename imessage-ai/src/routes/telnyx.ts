import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { sendSms } from "../lib/telnyx.js";
import { getOrCreateSmsThread } from "../services/users.js";
import { handleInboundMessage } from "../services/message-router.js";

const telnyxInboundSchema = z.object({
  data: z.object({
    event_type: z.string(),
    payload: z.object({
      id: z.string(),
      from: z.object({
        phone_number: z.string(),
      }),
      to: z.array(z.object({
        phone_number: z.string(),
      })),
      text: z.string().default(""),
      media: z.array(z.object({
        url: z.string(),
        content_type: z.string().optional(),
      })).default([]),
    }),
  }),
});

export async function registerTelnyxRoutes(app: FastifyInstance) {
  app.post("/inbound", async (request, reply) => {
    const parsed = telnyxInboundSchema.safeParse(request.body);

    if (!parsed.success) {
      request.log.warn({ issues: parsed.error.issues }, "Invalid Telnyx payload");
      return reply.code(200).send("OK");
    }

    const { event_type, payload } = parsed.data.data;

    if (event_type !== "message.received") {
      return reply.code(200).send("OK");
    }

    const from = payload.from.phone_number;
    const thread = await getOrCreateSmsThread(from);

    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        direction: "INBOUND",
        provider: "telnyx",
        providerMessageId: payload.id,
        bodyText: payload.text,
        mediaCount: payload.media.length,
        rawPayload: payload as object,
      },
    });

    for (const media of payload.media) {
      await prisma.mediaAsset.create({
        data: {
          messageId: message.id,
          providerMediaUrl: media.url,
          mimeType: media.content_type ?? null,
          storageKey: null,
        },
      });
    }

    const outcome = await handleInboundMessage({
      userId: thread.userId,
      threadId: thread.id,
      messageId: message.id,
      text: payload.text,
      mediaCount: payload.media.length,
    });

    const outbound = await sendSms({
      to: from,
      body: outcome.replyText,
    });

    await prisma.message.create({
      data: {
        threadId: thread.id,
        direction: "OUTBOUND",
        provider: "telnyx",
        providerMessageId: outbound.providerMessageId,
        bodyText: outcome.replyText,
        rawPayload: outbound.rawPayload as object,
      },
    });

    return reply.code(200).send("OK");
  });
}
