import { formatProgressReply } from "../lib/coach-voice.js";
import { prisma } from "../lib/prisma.js";

export async function buildDailyProgressReply(userId: string) {
  const today = startOfDay(new Date());

  const rollup = await prisma.dailyRollup.findUnique({
    where: {
      userId_dayDate: {
        userId,
        dayDate: today,
      },
    },
  });

  const goal = await prisma.goal.findFirst({
    where: {
      userId,
      active: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!rollup) {
    return "nothing logged yet today. text me meals as you go and i’ll keep track!";
  }

  if (!goal) {
    return formatProgressReply([
      `today you’re at ${Math.round(rollup.calories)} cal, ${Math.round(rollup.proteinG)}g protein, ${Math.round(rollup.carbsG)}g carbs, and ${Math.round(rollup.fatG)}g fat.`,
    ]);
  }

  const caloriesLeft = goal.targetCalories ? goal.targetCalories - rollup.calories : null;
  const proteinLeft = goal.targetProteinG ? goal.targetProteinG - rollup.proteinG : null;

  const calorieText =
    caloriesLeft === null
      ? `${Math.round(rollup.calories)} cal`
      : `${Math.round(rollup.calories)} cal logged, about ${Math.max(Math.round(caloriesLeft), 0)} left`;

  const proteinText =
    proteinLeft === null
      ? `${Math.round(rollup.proteinG)}g protein`
      : `${Math.round(rollup.proteinG)}g protein logged, about ${Math.max(Math.round(proteinLeft), 0)}g left`;

  return formatProgressReply([
    `today so far: ${calorieText}.`,
    `${proteinText}.`,
    `you’ve logged ${rollup.mealsLogged} meal${rollup.mealsLogged === 1 ? "" : "s"} so far.`,
  ]);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
