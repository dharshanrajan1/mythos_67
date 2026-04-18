import { prisma } from "./prisma.js";

type FetchAndStoreInboundMediaInput = {
  messageId: string;
  mediaCount: number;
  payload: Record<string, string | undefined>;
};

export async function fetchAndStoreInboundMedia(input: FetchAndStoreInboundMediaInput) {
  for (let index = 0; index < input.mediaCount; index += 1) {
    const mediaUrl = input.payload[`MediaUrl${index}`];
    const mimeType = input.payload[`MediaContentType${index}`];

    if (!mediaUrl) {
      continue;
    }

    await prisma.mediaAsset.create({
      data: {
        messageId: input.messageId,
        providerMediaUrl: mediaUrl,
        mimeType,
        storageKey: null,
      },
    });
  }
}
