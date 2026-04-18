import { env } from "../lib/env.js";
import { prisma } from "../lib/prisma.js";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getContextCoachAdvice(userId: string, message: string): Promise<string> {
  if (!env.OPENAI_API_KEY) {
    return "i'd suggest something light and high-protein — like grilled chicken, a salad with beans, or Greek yogurt if you can find it!";
  }

  const [goal, rollup, profile] = await Promise.all([
    prisma.goal.findFirst({
      where: { userId, active: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dailyRollup.findUnique({
      where: {
        userId_dayDate: {
          userId,
          dayDate: startOfDay(new Date()),
        },
      },
    }),
    prisma.profile.findUnique({ where: { userId } }),
  ]);

  const caloriesLeft = goal?.targetCalories && rollup
    ? Math.max(0, goal.targetCalories - rollup.calories)
    : goal?.targetCalories ?? null;

  const proteinLeft = goal?.targetProteinG && rollup
    ? Math.max(0, goal.targetProteinG - rollup.proteinG)
    : goal?.targetProteinG ?? null;

  const goalLabel = goal?.goalType === "LOSE"
    ? "losing fat"
    : goal?.goalType === "GAIN"
      ? "building muscle"
      : "maintaining weight";

  const dietPrefs = Array.isArray(profile?.dietaryPreferences)
    ? (profile.dietaryPreferences as string[]).join(", ")
    : null;

  const allergies = Array.isArray(profile?.allergies)
    ? (profile.allergies as string[]).join(", ")
    : null;

  const contextLines = [
    `User's goal: ${goalLabel}`,
    caloriesLeft !== null ? `Calories remaining today: ~${Math.round(caloriesLeft)}` : null,
    proteinLeft !== null ? `Protein remaining today: ~${Math.round(proteinLeft)}g` : null,
    rollup ? `Meals logged so far today: ${rollup.mealsLogged}` : "No meals logged yet today",
    dietPrefs ? `Diet preferences: ${dietPrefs}` : null,
    allergies ? `Allergies/avoid: ${allergies}` : null,
  ].filter(Boolean).join("\n");

  const systemPrompt = `You are Sam, a friendly real-talk nutrition coach for a national correspondent who eats on the go. Be direct and specific — name actual menu items or meal combos. Keep replies under 4 sentences. No fluff, no generic advice like "eat more protein".

User context:
${contextLines}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = data.choices?.[0]?.message?.content?.trim();
    return reply ?? fallbackAdvice(goalLabel);
  } catch {
    return fallbackAdvice(goalLabel);
  }
}

function fallbackAdvice(goalLabel: string): string {
  if (goalLabel === "losing fat") {
    return "go for grilled protein + veggies — skip the fries, get water instead of soda, and if it's fast food, a grilled chicken sandwich without the bun gets you there.";
  }
  if (goalLabel === "building muscle") {
    return "stack protein: double meat burrito, chicken sandwich with a side of beans, or any combo that gets you 40g+ protein. don't skip carbs — you need them right now.";
  }
  return "aim for a balanced plate — lean protein, some carbs, veggies if available. most fast-casual spots have a solid bowl option that fits.";
}
