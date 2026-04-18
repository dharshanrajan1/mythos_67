import { prisma } from "../lib/prisma.js";

export async function getRecentConversationText(userId: string, limit = 8) {
  const messages = await prisma.message.findMany({
    where: {
      thread: {
        userId,
      },
      bodyText: {
        not: null,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  const ordered = [...messages].reverse();
  const lines = ordered
    .map((message) => {
      const role = message.direction === "INBOUND" ? "user" : "sam";
      const text = message.bodyText?.trim();

      if (!text) {
        return null;
      }

      return `${role}: ${text}`;
    })
    .filter((line): line is string => Boolean(line));

  return lines.join("\n");
}
