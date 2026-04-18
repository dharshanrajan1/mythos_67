import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { getOrCreateSmsThread } from "../services/users.js";
import { handleInboundMessage } from "../services/message-router.js";

const simulateInboundSchema = z.object({
  from: z.string().min(1).default("+15555550123"),
  to: z.string().min(1).default("+15555550000"),
  body: z.string().default(""),
  mediaCount: z.coerce.number().int().min(0).default(0),
  providerMessageId: z.string().optional(),
  images: z.array(z.string()).default([]),
});

export async function registerSimulationRoutes(app: FastifyInstance) {
  app.post("/simulate/sms", async (request) => {
    const input = simulateInboundSchema.parse(request.body);
    const thread = await getOrCreateSmsThread(input.from);

    const effectiveMediaCount = input.images.length > 0 ? input.images.length : input.mediaCount;

    const inbound = await prisma.message.create({
      data: {
        threadId: thread.id,
        direction: "INBOUND",
        provider: "simulator",
        providerMessageId: input.providerMessageId ?? `sim_${Date.now()}`,
        bodyText: input.body,
        mediaCount: effectiveMediaCount,
        rawPayload: input,
      },
    });

    for (const imageDataUrl of input.images) {
      await prisma.mediaAsset.create({
        data: {
          messageId: inbound.id,
          providerMediaUrl: "data:simulated",
          mimeType: "image/jpeg",
          storageKey: imageDataUrl,
        },
      });
    }

    const outcome = await handleInboundMessage({
      userId: thread.userId,
      threadId: thread.id,
      messageId: inbound.id,
      text: input.body,
      mediaCount: effectiveMediaCount,
    });

    const outbound = await prisma.message.create({
      data: {
        threadId: thread.id,
        direction: "OUTBOUND",
        provider: "simulator",
        bodyText: outcome.replyText,
        rawPayload: {
          to: input.from,
          from: input.to,
          simulated: true,
        },
      },
    });

    return {
      ok: true,
      userId: thread.userId,
      threadId: thread.id,
      inboundMessageId: inbound.id,
      outboundMessageId: outbound.id,
      replyText: outcome.replyText,
    };
  });
}
