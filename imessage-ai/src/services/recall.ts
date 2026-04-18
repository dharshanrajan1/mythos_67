import { createJsonResponse } from "../lib/openai.js";
import { normalizeCoachText } from "../lib/coach-voice.js";
import { prisma } from "../lib/prisma.js";
import { getRecentConversationText } from "./conversation-context.js";

type RecallDecision = {
  is_recall_query: boolean;
};

type RecallAnswer = {
  reply: string;
};

export async function maybeHandleRecall(input: {
  userId: string;
  text: string;
}) {
  const decision = await classifyRecallQuery(input.userId, input.text);

  if (!decision.is_recall_query) {
    return null;
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const mealEvents = await prisma.mealEvent.findMany({
    where: {
      userId: input.userId,
      loggingState: "AUTO_LOGGED",
      mealTime: {
        gte: since,
      },
    },
    include: {
      mealItems: true,
    },
    orderBy: {
      mealTime: "asc",
    },
  });

  if (mealEvents.length === 0) {
    return {
      handled: true,
      replyText: "i don’t have anything logged in the last 24 hours yet. text me meals as you go and i’ll keep track!",
    };
  }

  const context = buildRecallContext(mealEvents);
  const replyText = await answerRecallQuestion(input.userId, input.text, context);

  return {
    handled: true,
    replyText,
  };
}

async function classifyRecallQuery(userId: string, text: string) {
  const lower = text.toLowerCase();

  if (
    lower.includes("what did i eat") ||
    lower.includes("what all did i eat") ||
    lower.includes("what have i eaten") ||
    lower.includes("did i eat") ||
    lower.includes("what was my") ||
    lower.includes("how much protein did i get") ||
    lower.includes("what have i logged") ||
    lower.includes("what did i log")
  ) {
    return {
      is_recall_query: true,
    } satisfies RecallDecision;
  }

  try {
    const conversation = await getRecentConversationText(userId);
    return await createJsonResponse<RecallDecision>({
      instructions:
        "decide whether the user is asking about previously logged meals, foods, nutrition totals, or anything that should be answered from recent meal log memory rather than logged as a new meal.",
      content: [
        {
          type: "input_text",
          text: `recent conversation:\n${conversation}\n\ncurrent user message:\n${text}`,
        },
      ],
      schemaName: "recall_decision",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          is_recall_query: { type: "boolean" },
        },
        required: ["is_recall_query"],
      },
    });
  } catch {
    return {
      is_recall_query: false,
    } satisfies RecallDecision;
  }
}

async function answerRecallQuestion(userId: string, question: string, context: string) {
  try {
    const conversation = await getRecentConversationText(userId);
    const result = await createJsonResponse<RecallAnswer>({
      instructions:
        "you are sam, a chill nutrition coach texting the user. answer the user's question only from the provided meal log context from the last 24 hours. do not invent meals or numbers. if the answer is uncertain, say that briefly. keep it concise, helpful, and natural.",
      content: [
        {
          type: "input_text",
          text: `recent conversation:\n${conversation}\n\nmeal log context:\n${context}\n\nuser question:\n${question}`,
        },
      ],
      schemaName: "recall_answer",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          reply: { type: "string" },
        },
        required: ["reply"],
      },
    });

    return normalizeCoachText(result.reply);
  } catch {
    return normalizeCoachText(fallbackRecallAnswer(question, context));
  }
}

function buildRecallContext(
  mealEvents: Array<{
    mealTime: Date | null;
    mealItems: Array<{
      nameRaw: string;
      calories: number | null;
      proteinG: number | null;
      carbsG: number | null;
      fatG: number | null;
    }>;
  }>,
) {
  const lines: string[] = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const event of mealEvents) {
    const itemParts = event.mealItems.map((item) => {
      totalCalories += item.calories ?? 0;
      totalProtein += item.proteinG ?? 0;
      totalCarbs += item.carbsG ?? 0;
      totalFat += item.fatG ?? 0;

      return `${item.nameRaw} (${Math.round(item.calories ?? 0)} cal, ${Math.round(item.proteinG ?? 0)}p, ${Math.round(item.carbsG ?? 0)}c, ${Math.round(item.fatG ?? 0)}f)`;
    });

    lines.push(
      `${formatTimestamp(event.mealTime)}: ${itemParts.join("; ")}`,
    );
  }

  lines.push(
    `totals: ${Math.round(totalCalories)} cal, ${Math.round(totalProtein)}p, ${Math.round(totalCarbs)}c, ${Math.round(totalFat)}f`,
  );

  return lines.join("\n");
}

function fallbackRecallAnswer(question: string, context: string) {
  const lower = question.toLowerCase();

  if (lower.includes("what did i eat") || lower.includes("what have i logged")) {
    return context;
  }

  return "here’s what i have from the last 24 hours:\n" + context;
}

function formatTimestamp(value: Date | null) {
  if (!value) {
    return "unknown time";
  }

  return value.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}
