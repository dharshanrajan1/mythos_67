import { prisma } from "../lib/prisma.js";
import { formatLoggedMealReply } from "../lib/coach-voice.js";
import { resolveNutritionEstimate } from "./nutrition-resolver.js";
import { updateDailyRollup } from "./rollups.js";
export async function ingestMealMessage(input) {
    const mediaAssets = await prisma.mediaAsset.findMany({
        where: {
            messageId: input.messageId,
        },
    });
    const mealEvent = await prisma.mealEvent.create({
        data: {
            userId: input.userId,
            sourceMessageId: input.messageId,
            eventType: "MEAL_LOG",
            loggingState: "PENDING",
            mealTime: new Date(),
        },
    });
    const estimate = await resolveNutritionEstimate({
        userId: input.userId,
        text: input.text,
        imageUrls: mediaAssets
            .map((asset) => asset.storageKey ?? null)
            .filter((value) => Boolean(value)),
    });
    if (estimate.needsClarification) {
        await prisma.mealEvent.update({
            where: { id: mealEvent.id },
            data: {
                loggingState: "NEEDS_CLARIFICATION",
                confidenceScore: estimate.confidenceScore,
            },
        });
        return {
            mealEventId: mealEvent.id,
            needsClarification: true,
            replyText: estimate.replyText,
        };
    }
    for (const item of estimate.items) {
        await prisma.mealItem.create({
            data: {
                mealEventId: mealEvent.id,
                nameRaw: item.name,
                nameCanonical: item.name,
                quantity: item.quantity,
                unit: item.unit,
                gramsEstimated: item.gramsEstimated,
                foodSource: item.foodSource,
                foodSourceRef: item.foodSourceRef,
                calories: item.calories,
                proteinG: item.proteinG,
                carbsG: item.carbsG,
                fatG: item.fatG,
                fiberG: item.fiberG,
                confidenceScore: estimate.confidenceScore,
            },
        });
    }
    await prisma.mealEvent.update({
        where: { id: mealEvent.id },
        data: {
            loggingState: "AUTO_LOGGED",
            confidenceScore: estimate.confidenceScore,
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
        mealEventId: mealEvent.id,
        needsClarification: false,
        replyText: formatLoggedMealReply({
            mealLabel: estimate.mealLabel,
            items: estimate.items.map((item) => ({
                name: item.name,
                calories: item.calories,
                proteinG: item.proteinG,
                carbsG: item.carbsG,
                fatG: item.fatG,
            })),
            calories: estimate.totals.calories,
            proteinG: estimate.totals.proteinG,
            carbsG: estimate.totals.carbsG,
            fatG: estimate.totals.fatG,
            targetCalories: goal?.targetCalories,
            targetProteinG: goal?.targetProteinG,
            dayCalories: rollup?.calories,
            dayProteinG: rollup?.proteinG,
        }),
    };
}
function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}
