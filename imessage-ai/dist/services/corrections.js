import { normalizeCoachText } from "../lib/coach-voice.js";
import { createJsonResponse } from "../lib/openai.js";
import { prisma } from "../lib/prisma.js";
import { getRecentConversationText } from "./conversation-context.js";
import { updateDailyRollup } from "./rollups.js";
export async function maybeHandleCorrection(input) {
    const parsed = await parseCorrection(input.userId, input.text);
    if (!parsed.is_correction) {
        return null;
    }
    const recentMealItems = await prisma.mealItem.findMany({
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
        take: 12,
    });
    const targetItem = resolveTargetMealItem(recentMealItems, parsed.target_item_name);
    if (!targetItem) {
        return {
            handled: true,
            replyText: "i can fix it, but i need the meal name. say something like `change spicy deluxe to 34g protein and 26g fat`.",
        };
    }
    const nextValues = {
        calories: parsed.calories ?? targetItem.calories,
        proteinG: parsed.protein_g ?? targetItem.proteinG,
        carbsG: parsed.carbs_g ?? targetItem.carbsG,
        fatG: parsed.fat_g ?? targetItem.fatG,
        fiberG: parsed.fiber_g ?? targetItem.fiberG,
    };
    await prisma.mealItem.update({
        where: {
            id: targetItem.id,
        },
        data: nextValues,
    });
    await prisma.correction.create({
        data: {
            userId: input.userId,
            mealItemId: targetItem.id,
            correctionType: "macro_update",
            oldValue: {
                calories: targetItem.calories,
                proteinG: targetItem.proteinG,
                carbsG: targetItem.carbsG,
                fatG: targetItem.fatG,
                fiberG: targetItem.fiberG,
            },
            newValue: nextValues,
        },
    });
    await updateDailyRollup(input.userId);
    const rollup = await prisma.dailyRollup.findUnique({
        where: {
            userId_dayDate: {
                userId: input.userId,
                dayDate: startOfDay(new Date()),
            },
        },
    });
    const goal = await prisma.goal.findFirst({
        where: {
            userId: input.userId,
            active: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return {
        handled: true,
        replyText: normalizeCoachText(`got it! i updated ${targetItem.nameRaw} to ${Math.round(nextValues.calories ?? 0)} cal, ${Math.round(nextValues.proteinG ?? 0)}p, ${Math.round(nextValues.carbsG ?? 0)}c, and ${Math.round(nextValues.fatG ?? 0)}f. ${goal && rollup
            ? `you’ve got about ${Math.max(Math.round((goal.targetCalories ?? 0) - rollup.calories), 0)} cal and ${Math.max(Math.round((goal.targetProteinG ?? 0) - rollup.proteinG), 0)}g protein left today.`
            : ""}`),
    };
}
async function parseCorrection(userId, text) {
    const conversation = await getRecentConversationText(userId);
    try {
        return await createJsonResponse({
            instructions: "determine whether the user is correcting a previously logged meal item. extract any explicit target item name and any nutrition numbers they want changed. if the user is giving revised nutrition facts for the last mentioned meal, set is_correction true even if they do not say the meal name explicitly.",
            content: [
                {
                    type: "input_text",
                    text: `recent conversation:\n${conversation}\n\ncurrent user message:\n${text}`,
                },
            ],
            schemaName: "meal_correction",
            schema: {
                type: "object",
                additionalProperties: false,
                properties: {
                    is_correction: { type: "boolean" },
                    target_item_name: { type: ["string", "null"] },
                    calories: { type: ["number", "null"] },
                    protein_g: { type: ["number", "null"] },
                    carbs_g: { type: ["number", "null"] },
                    fat_g: { type: ["number", "null"] },
                    fiber_g: { type: ["number", "null"] },
                },
                required: [
                    "is_correction",
                    "target_item_name",
                    "calories",
                    "protein_g",
                    "carbs_g",
                    "fat_g",
                    "fiber_g",
                ],
            },
        });
    }
    catch {
        return parseCorrectionFallback(text);
    }
}
function parseCorrectionFallback(text) {
    const lower = text.toLowerCase();
    const targetMatch = lower.match(/change\s+(.+?)\s+(?:i ate\s+)?to\b|update\s+(.+?)\s+to\b/);
    return {
        is_correction: lower.includes("should be") ||
            lower.includes("change ") ||
            lower.includes("update ") ||
            lower.includes("actually"),
        target_item_name: targetMatch?.[1] ?? targetMatch?.[2] ?? null,
        calories: matchMacroNumber(lower, /(\d+(?:\.\d+)?)\s*(?:cal|calories)\b/),
        protein_g: matchMacroNumber(lower, /(\d+(?:\.\d+)?)\s*g\s*protein\b|protein\D{0,8}(\d+(?:\.\d+)?)\s*g?/),
        carbs_g: matchMacroNumber(lower, /(\d+(?:\.\d+)?)\s*g\s*(?:carbs|carbohydrates)\b|carbohydrates\D{0,8}(\d+(?:\.\d+)?)\s*g?/),
        fat_g: matchMacroNumber(lower, /(\d+(?:\.\d+)?)\s*g\s*(?:fat|total fat)\b|total fat\D{0,8}(\d+(?:\.\d+)?)\s*g?/),
        fiber_g: matchMacroNumber(lower, /(\d+(?:\.\d+)?)\s*g\s*fiber\b|fiber\D{0,8}(\d+(?:\.\d+)?)\s*g?/),
    };
}
function resolveTargetMealItem(items, targetName) {
    if (!targetName) {
        return items[0] ?? null;
    }
    const targetTokens = tokenize(targetName);
    const ranked = [...items].sort((left, right) => scoreNameMatch(targetTokens, right.nameRaw) - scoreNameMatch(targetTokens, left.nameRaw));
    return ranked[0] ?? items[0] ?? null;
}
function scoreNameMatch(tokens, candidate) {
    const candidateTokens = tokenize(candidate);
    let overlap = 0;
    for (const token of tokens) {
        if (candidateTokens.has(token)) {
            overlap += 1;
        }
    }
    return tokens.size === 0 ? 0 : overlap / tokens.size;
}
function tokenize(value) {
    return new Set(value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 1));
}
function matchMacroNumber(text, pattern) {
    const match = text.match(pattern);
    const value = match?.[1] ?? match?.[2];
    return value ? Number(value) : null;
}
function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}
