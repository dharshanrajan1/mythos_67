import { createJsonResponse } from "../lib/openai.js";
import { normalizeCoachText } from "../lib/coach-voice.js";
import { prisma } from "../lib/prisma.js";
import { getRecentConversationText } from "./conversation-context.js";
import { updateDailyRollup } from "./rollups.js";

type DeleteDecision = {
  is_delete_request: boolean;
  scope: "today" | "last_24_hours" | "specific_item" | "unknown";
  target_item_name: string | null;
};

export async function maybeHandleDeletion(input: {
  userId: string;
  text: string;
}) {
  const parsed = await parseDeleteRequest(input.userId, input.text);

  if (!parsed.is_delete_request) {
    return null;
  }

  if (parsed.scope === "today" || parsed.scope === "last_24_hours") {
    const start = parsed.scope === "today" ? startOfDay(new Date()) : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const mealEvents = await prisma.mealEvent.findMany({
      where: {
        userId: input.userId,
        loggingState: "AUTO_LOGGED",
        mealTime: {
          gte: start,
        },
      },
      include: {
        mealItems: true,
      },
    });

    if (mealEvents.length === 0) {
      return {
        handled: true,
        replyText: "nothing to delete there. i don’t have any logged meals in that range.",
      };
    }

    const names = mealEvents.flatMap((event) => event.mealItems.map((item) => item.nameRaw));
    const deletedCount = mealEvents.length;

    await prisma.mealEvent.deleteMany({
      where: {
        id: {
          in: mealEvents.map((event) => event.id),
        },
      },
    });

    await prisma.dailyRollup.deleteMany({
      where: {
        userId: input.userId,
        dayDate: {
          gte: startOfDay(start),
        },
      },
    });

    await updateDailyRollup(input.userId);

    return {
      handled: true,
      replyText: normalizeCoachText(
        `got it! i deleted ${parsed.scope === "today" ? "everything you ate today" : "those recent meals"} (${deletedCount} meal${deletedCount === 1 ? "" : "s"}). removed items: ${summarizeNames(names)}.`,
      ),
    };
  }

  if (parsed.scope === "specific_item" && parsed.target_item_name) {
    const mealItems = await prisma.mealItem.findMany({
      where: {
        mealEvent: {
          userId: input.userId,
          loggingState: "AUTO_LOGGED",
        },
      },
      include: {
        mealEvent: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const matchedItem = resolveTargetMealItem(mealItems, parsed.target_item_name);

    if (!matchedItem) {
      return {
        handled: true,
        replyText: "i couldn’t find that item in your recent log. tell me the meal name and i’ll remove it.",
      };
    }

    const mealEventId = matchedItem.mealEventId;
    const itemCount = await prisma.mealItem.count({
      where: { mealEventId },
    });

    if (itemCount <= 1) {
      await prisma.mealEvent.delete({
        where: { id: mealEventId },
      });
    } else {
      await prisma.mealItem.delete({
        where: { id: matchedItem.id },
      });
    }

    await prisma.dailyRollup.deleteMany({
      where: {
        userId: input.userId,
        dayDate: {
          gte: startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        },
      },
    });

    await updateDailyRollup(input.userId);

    return {
      handled: true,
      replyText: normalizeCoachText(`got it! i removed ${matchedItem.nameRaw} from your log.`),
    };
  }

  return {
    handled: true,
    replyText: "i can delete it, but tell me whether you want me to remove all of today or a specific item.",
  };
}

async function parseDeleteRequest(userId: string, text: string) {
  const lower = text.toLowerCase();

  if (lower.includes("delete everything i ate today") || lower.includes("clear everything i ate today")) {
    return {
      is_delete_request: true,
      scope: "today",
      target_item_name: null,
    } satisfies DeleteDecision;
  }

  const conversation = await getRecentConversationText(userId);

  try {
    return await createJsonResponse<DeleteDecision>({
      instructions:
        "decide whether the user wants to delete food logs. classify whether they mean all of today, the last 24 hours, or one specific item. if specific, extract the item name.",
      content: [
        {
          type: "input_text",
          text: `recent conversation:\n${conversation}\n\ncurrent user message:\n${text}`,
        },
      ],
      schemaName: "delete_decision",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          is_delete_request: { type: "boolean" },
          scope: {
            type: "string",
            enum: ["today", "last_24_hours", "specific_item", "unknown"],
          },
          target_item_name: { type: ["string", "null"] },
        },
        required: ["is_delete_request", "scope", "target_item_name"],
      },
    });
  } catch {
    return parseDeleteFallback(text);
  }
}

function parseDeleteFallback(text: string): DeleteDecision {
  const lower = text.toLowerCase();
  const targetMatch = lower.match(/delete\s+(.+?)$|remove\s+(.+?)$/);

  return {
    is_delete_request:
      lower.includes("delete") ||
      lower.includes("remove") ||
      lower.includes("clear"),
    scope: lower.includes("today")
      ? "today"
      : lower.includes("last 24")
        ? "last_24_hours"
        : targetMatch
          ? "specific_item"
          : "unknown",
    target_item_name:
      lower.includes("today") || lower.includes("last 24")
        ? null
        : targetMatch?.[1] ?? targetMatch?.[2] ?? null,
  };
}

function resolveTargetMealItem(
  items: Array<{
    id: string;
    mealEventId: string;
    nameRaw: string;
  }>,
  targetName: string,
) {
  const targetTokens = tokenize(targetName);
  const ranked = [...items].sort(
    (left, right) => scoreNameMatch(targetTokens, right.nameRaw) - scoreNameMatch(targetTokens, left.nameRaw),
  );

  const best = ranked[0] ?? null;

  if (!best || scoreNameMatch(targetTokens, best.nameRaw) < 0.4) {
    return null;
  }

  return best;
}

function scoreNameMatch(tokens: Set<string>, candidate: string) {
  const candidateTokens = tokenize(candidate);
  let overlap = 0;

  for (const token of tokens) {
    if (candidateTokens.has(token)) {
      overlap += 1;
    }
  }

  return tokens.size === 0 ? 0 : overlap / tokens.size;
}

function tokenize(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 1),
  );
}

function summarizeNames(names: string[]) {
  const unique = [...new Set(names)];
  return unique.slice(0, 4).join(", ");
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
