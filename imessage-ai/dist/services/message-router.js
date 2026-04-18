import { prisma } from "../lib/prisma.js";
import { buildDailyProgressReply } from "./coaching.js";
import { maybeHandleCorrection } from "./corrections.js";
import { maybeHandleDeletion } from "./deletions.js";
import { getOnboardingState, handleOnboardingReply } from "./onboarding.js";
import { maybeHandleRecall } from "./recall.js";
import { ingestMealMessage } from "./meal-ingest.js";
export async function handleInboundMessage(input) {
    const onboarding = await getOnboardingState(input.userId);
    if (!onboarding.isComplete) {
        const normalized = input.text.trim().toLowerCase();
        const isGreetingOnly = normalized === "" ||
            normalized === "hi" ||
            normalized === "hello" ||
            normalized === "hey" ||
            normalized === "start" ||
            normalized === "yo";
        if (!onboarding.hasAnswers && onboarding.nextQuestion && isGreetingOnly) {
            return {
                replyText: `hey, i’m sam! i’ll help you track meals, stay on target, and make this feel easy. first up: ${onboarding.nextQuestion}`,
            };
        }
        return handleOnboardingReply(input.userId, input.text);
    }
    const normalized = input.text.trim().toLowerCase();
    if (normalized.includes("how am i doing") || normalized.includes("progress")) {
        const replyText = await buildDailyProgressReply(input.userId);
        return { replyText };
    }
    const deletion = await maybeHandleDeletion({
        userId: input.userId,
        text: input.text,
    });
    if (deletion?.handled) {
        return {
            replyText: deletion.replyText,
        };
    }
    const recall = await maybeHandleRecall({
        userId: input.userId,
        text: input.text,
    });
    if (recall?.handled) {
        return {
            replyText: recall.replyText,
        };
    }
    const correction = await maybeHandleCorrection({
        userId: input.userId,
        messageId: input.messageId,
        text: input.text,
    });
    if (correction?.handled) {
        return {
            replyText: correction.replyText,
        };
    }
    const meal = await ingestMealMessage({
        userId: input.userId,
        messageId: input.messageId,
        text: input.text,
        mediaCount: input.mediaCount,
    });
    if (meal.needsClarification) {
        await prisma.clarification.create({
            data: {
                mealEventId: meal.mealEventId,
                question: meal.replyText,
            },
        });
    }
    return {
        replyText: meal.replyText,
    };
}
