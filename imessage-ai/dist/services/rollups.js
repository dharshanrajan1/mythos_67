import { prisma } from "../lib/prisma.js";
export async function updateDailyRollup(userId) {
    const dayDate = startOfDay(new Date());
    const mealEvents = await prisma.mealEvent.findMany({
        where: {
            userId,
            loggingState: "AUTO_LOGGED",
            mealTime: {
                gte: dayDate,
            },
        },
        include: {
            mealItems: true,
        },
    });
    const totals = mealEvents.reduce((acc, event) => {
        acc.mealsLogged += 1;
        for (const item of event.mealItems) {
            acc.calories += item.calories ?? 0;
            acc.proteinG += item.proteinG ?? 0;
            acc.carbsG += item.carbsG ?? 0;
            acc.fatG += item.fatG ?? 0;
            acc.fiberG += item.fiberG ?? 0;
        }
        return acc;
    }, {
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatG: 0,
        fiberG: 0,
        mealsLogged: 0,
    });
    await prisma.dailyRollup.upsert({
        where: {
            userId_dayDate: {
                userId,
                dayDate,
            },
        },
        update: totals,
        create: {
            userId,
            dayDate,
            ...totals,
        },
    });
}
function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}
