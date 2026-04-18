import { calculateNutritionTargets } from "../lib/nutrition-targets.js";
import { createJsonResponse } from "../lib/openai.js";
import { prisma } from "../lib/prisma.js";
import { getRecentConversationText } from "./conversation-context.js";

const onboardingQuestions = [
  "what’s your main goal right now: lose fat, maintain, or gain muscle?",
  "got you. send your age, sex, height, and current weight in whatever format feels natural!",
  "how many days per week do you usually exercise or train?",
  "any diet preferences, allergies, foods you avoid, or macro priorities?",
];

type GoalParse = {
  goal_type: "LOSE" | "MAINTAIN" | "GAIN";
  note: string | null;
};

type BodyStatsParse = {
  age: number | null;
  sex: "male" | "female" | null;
  height_cm: number | null;
  weight_kg: number | null;
  first_name: string | null;
};

type ActivityParse = {
  exercise_days_per_week: number | null;
  activity_note: string | null;
};

type DietParse = {
  dietary_preferences: string[];
  allergies: string[];
  notes: string | null;
};

export async function getOnboardingState(userId: string) {
  const session = await prisma.onboardingSession.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const isComplete = session.currentStep === "COMPLETE";
  const nextQuestion = isComplete ? null : getQuestionForStep(session.currentStep);
  const hasAnswers = Boolean(session.answers);

  return {
    isComplete,
    nextQuestion,
    hasAnswers,
  };
}

export async function handleOnboardingReply(userId: string, text: string) {
  const session = await prisma.onboardingSession.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const answers = ((session.answers as Record<string, unknown> | null) ?? {});
  const replyText = text.trim();

  if (session.currentStep === "GOAL") {
    const parsed = await parseGoal(userId, replyText);

    await prisma.goal.updateMany({
      where: { userId, active: true },
      data: { active: false },
    });

    await prisma.goal.create({
      data: {
        userId,
        goalType: parsed.goal_type,
      },
    });

    await prisma.onboardingSession.update({
      where: { userId },
      data: {
        currentStep: "BODY_STATS",
        answers: {
          ...answers,
          goal: replyText,
          goalNote: parsed.note,
        },
      },
    });

    return {
      replyText: onboardingQuestions[1],
    };
  }

  if (session.currentStep === "BODY_STATS") {
    const parsed = await parseBodyStats(userId, replyText);

    if (!parsed.age || !parsed.height_cm || !parsed.weight_kg) {
      return {
        replyText:
          "need a little more here. send age, height, and current weight together, like `28 male 5'10 180 lb`!",
      };
    }

    await prisma.profile.upsert({
      where: { userId },
      update: {
        firstName: parsed.first_name ?? undefined,
        sex: parsed.sex,
        birthYear: new Date().getFullYear() - parsed.age,
        heightCm: parsed.height_cm,
        currentWeightKg: parsed.weight_kg,
        startWeightKg: parsed.weight_kg,
      },
      create: {
        userId,
        firstName: parsed.first_name ?? undefined,
        sex: parsed.sex,
        birthYear: new Date().getFullYear() - parsed.age,
        heightCm: parsed.height_cm,
        currentWeightKg: parsed.weight_kg,
        startWeightKg: parsed.weight_kg,
      },
    });

    await prisma.onboardingSession.update({
      where: { userId },
      data: {
        currentStep: "ACTIVITY",
        answers: {
          ...answers,
          bodyStats: replyText,
        },
      },
    });

    return {
      replyText: onboardingQuestions[2],
    };
  }

  if (session.currentStep === "ACTIVITY") {
    const parsed = await parseActivity(userId, replyText);

    if (parsed.exercise_days_per_week === null) {
      return {
        replyText:
          "just send the number of days you usually train each week, like `4 days` or `three times a week`!",
      };
    }

    await prisma.profile.upsert({
      where: { userId },
      update: {
        activityLevel: parsed.activity_note,
        exerciseDaysPerWeek: parsed.exercise_days_per_week,
      },
      create: {
        userId,
        activityLevel: parsed.activity_note,
        exerciseDaysPerWeek: parsed.exercise_days_per_week,
      },
    });

    await prisma.onboardingSession.update({
      where: { userId },
      data: {
        currentStep: "DIET",
        answers: {
          ...answers,
          activity: parsed.activity_note,
          exerciseDaysPerWeek: parsed.exercise_days_per_week,
        },
      },
    });

    return {
      replyText: onboardingQuestions[3],
    };
  }

  if (session.currentStep === "DIET") {
    const parsed = await parseDiet(userId, replyText);

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        dietaryPreferences: parsed.dietary_preferences,
        allergies: parsed.allergies,
      },
      create: {
        userId,
        dietaryPreferences: parsed.dietary_preferences,
        allergies: parsed.allergies,
      },
    });

    const goal = await prisma.goal.findFirst({
      where: { userId, active: true },
      orderBy: { createdAt: "desc" },
    });

    const age = profile.birthYear ? new Date().getFullYear() - profile.birthYear : null;
    const targets = goal
      ? calculateNutritionTargets({
          goalType: goal.goalType,
          sex: profile.sex === "male" || profile.sex === "female" ? profile.sex : null,
          age,
          heightCm: profile.heightCm,
          weightKg: profile.currentWeightKg,
          exerciseDaysPerWeek: profile.exerciseDaysPerWeek,
        })
      : null;

    if (goal && targets) {
      await prisma.goal.update({
        where: { id: goal.id },
        data: targets,
      });
    }

    await prisma.onboardingSession.update({
      where: { userId },
      data: {
        currentStep: "COMPLETE",
        completedAt: new Date(),
        answers: {
          ...answers,
          diet: replyText,
          dietNotes: parsed.notes,
        },
      },
    });

    const targetText = targets
      ? ` i’m setting you at about ${targets.targetCalories} cal with ${targets.targetProteinG}g protein to start.`
      : "";

    return {
      replyText: `perfect, you’re set!${targetText} just text meals however you want and i’ll track everything for you.`,
    };
  }

  return {
    replyText: "you’re already set up. just text me what you ate and i’ll log it!",
  };
}

function getQuestionForStep(step: "GOAL" | "BODY_STATS" | "ACTIVITY" | "DIET" | "COMPLETE") {
  switch (step) {
    case "GOAL":
      return onboardingQuestions[0];
    case "BODY_STATS":
      return onboardingQuestions[1];
    case "ACTIVITY":
      return onboardingQuestions[2];
    case "DIET":
      return onboardingQuestions[3];
    case "COMPLETE":
      return null;
  }
}

async function parseGoal(userId: string, text: string) {
  const conversation = await getRecentConversationText(userId);

  try {
    return await createJsonResponse<GoalParse>({
      instructions:
        "extract the user's primary fitness goal from onboarding. map body recomposition goals to maintain unless the user clearly prioritizes gain or loss. keep note short if helpful, like 'recomp'.",
      content: [
        {
          type: "input_text",
          text: `recent conversation:\n${conversation}\n\ncurrent onboarding reply:\n${text}`,
        },
      ],
      schemaName: "goal_parse",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          goal_type: {
            type: "string",
            enum: ["LOSE", "MAINTAIN", "GAIN"],
          },
          note: { type: ["string", "null"] },
        },
        required: ["goal_type", "note"],
      },
    });
  } catch {
    const normalized = text.toLowerCase();

    if (normalized.includes("gain") && normalized.includes("lose")) {
      return {
        goal_type: "MAINTAIN",
        note: "recomp",
      } satisfies GoalParse;
    }

    if (normalized.includes("gain")) {
      return {
        goal_type: "GAIN",
        note: null,
      } satisfies GoalParse;
    }

    if (normalized.includes("maint")) {
      return {
        goal_type: "MAINTAIN",
        note: null,
      } satisfies GoalParse;
    }

    return {
      goal_type: "LOSE",
      note: null,
    } satisfies GoalParse;
  }
}

async function parseBodyStats(userId: string, text: string) {
  const conversation = await getRecentConversationText(userId);

  try {
    return await createJsonResponse<BodyStatsParse>({
      instructions:
        "extract body stats from the user's onboarding reply. return height in centimeters and weight in kilograms. if a field is missing, return null. do not guess age, height, or weight.",
      content: [
        {
          type: "input_text",
          text: `recent conversation:\n${conversation}\n\ncurrent onboarding reply:\n${text}`,
        },
      ],
      schemaName: "body_stats",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          age: { type: ["integer", "null"] },
          sex: { type: ["string", "null"], enum: ["male", "female", null] },
          height_cm: { type: ["number", "null"] },
          weight_kg: { type: ["number", "null"] },
          first_name: { type: ["string", "null"] },
        },
        required: ["age", "sex", "height_cm", "weight_kg", "first_name"],
      },
    });
  } catch {
    return parseBodyStatsFallback(text);
  }
}

async function parseActivity(userId: string, text: string) {
  const conversation = await getRecentConversationText(userId);

  try {
    return await createJsonResponse<ActivityParse>({
      instructions:
        "extract how many days per week the user usually exercises or trains. convert english words like 'three' into digits. if the user gives a range, choose the most representative single number. also return a short activity note if useful.",
      content: [
        {
          type: "input_text",
          text: `recent conversation:\n${conversation}\n\ncurrent onboarding reply:\n${text}`,
        },
      ],
      schemaName: "activity_days",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          exercise_days_per_week: { type: ["integer", "null"] },
          activity_note: { type: ["string", "null"] },
        },
        required: ["exercise_days_per_week", "activity_note"],
      },
    });
  } catch {
    return parseActivityFallback(text);
  }
}

async function parseDiet(userId: string, text: string) {
  const conversation = await getRecentConversationText(userId);

  try {
    return await createJsonResponse<DietParse>({
      instructions:
        "extract diet preferences, allergies, and any extra notes from the user's onboarding reply. keep lists short and normalized.",
      content: [
        {
          type: "input_text",
          text: `recent conversation:\n${conversation}\n\ncurrent onboarding reply:\n${text}`,
        },
      ],
      schemaName: "diet_preferences",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          dietary_preferences: {
            type: "array",
            items: { type: "string" },
          },
          allergies: {
            type: "array",
            items: { type: "string" },
          },
          notes: { type: ["string", "null"] },
        },
        required: ["dietary_preferences", "allergies", "notes"],
      },
    });
  } catch {
    return parseDietFallback(text);
  }
}

function parseBodyStatsFallback(text: string): BodyStatsParse {
  const lower = text.toLowerCase();
  const ageMatch = lower.match(/\b(\d{2})\b/);
  const feetInchesMatch = lower.match(/(\d)\s*(?:'|ft)\s*(\d{1,2})?/);
  const cmMatch = lower.match(/(\d{3})\s*cm/);
  const poundsMatch = lower.match(/(\d{2,3})\s*(?:lb|lbs|pounds)/);
  const kgMatch = lower.match(/(\d{2,3})\s*kg/);
  const nameMatch = text.match(/^([A-Z][a-z]+)/);

  let heightCm: number | null = null;

  if (cmMatch) {
    heightCm = Number(cmMatch[1]);
  } else if (feetInchesMatch) {
    const feet = Number(feetInchesMatch[1]);
    const inches = Number(feetInchesMatch[2] ?? 0);
    heightCm = Math.round((feet * 12 + inches) * 2.54);
  }

  const weightKg = kgMatch
    ? Number(kgMatch[1])
    : poundsMatch
      ? Math.round(Number(poundsMatch[1]) * 0.453592 * 10) / 10
      : null;

  return {
    age: ageMatch ? Number(ageMatch[1]) : null,
    sex: lower.includes("female") || lower.includes("woman") ? "female" : lower.includes("male") || lower.includes("man") ? "male" : null,
    height_cm: heightCm,
    weight_kg: weightKg,
    first_name: nameMatch?.[1] ?? null,
  };
}

function parseActivityFallback(text: string): ActivityParse {
  const lower = text.toLowerCase();
  const directDigit = lower.match(/\b([0-7])\b/);
  const xPattern = lower.match(/\b([0-7])\s*x\b/);
  const englishMap: Record<string, number> = {
    zero: 0,
    one: 1,
    once: 1,
    two: 2,
    twice: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    daily: 7,
    everyday: 7,
  };

  let days: number | null = null;

  if (xPattern) {
    days = Number(xPattern[1]);
  } else if (directDigit) {
    days = Number(directDigit[1]);
  } else {
    for (const [word, value] of Object.entries(englishMap)) {
      if (lower.includes(word)) {
        days = value;
        break;
      }
    }
  }

  return {
    exercise_days_per_week: days,
    activity_note: text,
  };
}

function parseDietFallback(text: string): DietParse {
  const lower = text.toLowerCase();

  const dietary_preferences = [
    lower.includes("vegetarian") ? "vegetarian" : null,
    lower.includes("vegan") ? "vegan" : null,
    lower.includes("halal") ? "halal" : null,
    lower.includes("kosher") ? "kosher" : null,
    lower.includes("high protein") ? "high protein" : null,
  ].filter((value): value is string => Boolean(value));

  const allergies = [
    lower.includes("peanut") ? "peanuts" : null,
    lower.includes("dairy") ? "dairy" : null,
    lower.includes("gluten") ? "gluten" : null,
    lower.includes("shellfish") ? "shellfish" : null,
  ].filter((value): value is string => Boolean(value));

  return {
    dietary_preferences,
    allergies,
    notes: text,
  };
}
