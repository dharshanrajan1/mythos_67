type MealReplyInput = {
  mealLabel: string;
  items: Array<{
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  }>;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  targetCalories?: number | null;
  targetProteinG?: number | null;
  dayCalories?: number;
  dayProteinG?: number;
};

export function formatLoggedMealReply(input: MealReplyInput) {
  const intro = pickIntro(input.proteinG);
  const itemLines = input.items
    .map(
      (item) =>
        `${shortenName(item.name)} ${Math.round(item.calories)} cal | ${Math.round(item.proteinG)}p ${Math.round(item.carbsG)}c ${Math.round(item.fatG)}f`,
    )
    .join("; ");

  const mealText = `${intro} logged ${input.mealLabel}! ${itemLines}. total ${Math.round(input.calories)} cal | ${Math.round(input.proteinG)}p ${Math.round(input.carbsG)}c ${Math.round(input.fatG)}f.`;

  if (
    input.targetCalories &&
    typeof input.dayCalories === "number" &&
    input.targetProteinG &&
    typeof input.dayProteinG === "number"
  ) {
    const caloriesLeft = Math.max(Math.round(input.targetCalories - input.dayCalories), 0);
    const proteinLeft = Math.max(Math.round(input.targetProteinG - input.dayProteinG), 0);

    return `${mealText} you’ve got about ${caloriesLeft} cal and ${proteinLeft}g protein left today.`;
  }

  return mealText;
}

export function formatClarificationReply(question: string) {
  return normalizeCoachText(question);
}

export function formatProgressReply(parts: string[]) {
  return normalizeCoachText(parts.join(" "));
}

export function normalizeCoachText(text: string) {
  const normalized = text.trim().replace(/\s+/g, " ").toLowerCase();
  return softenPunctuation(normalized);
}

function pickIntro(proteinG: number) {
  if (proteinG >= 35) {
    return "nice!";
  }

  if (proteinG >= 20) {
    return "got it!";
  }

  return "cool!";
}

function shortenName(value: string) {
  const trimmed = value.trim();

  if (trimmed.length <= 32) {
    return trimmed;
  }

  return `${trimmed.slice(0, 29)}...`;
}

function softenPunctuation(text: string) {
  if (text.includes("!")) {
    return text;
  }

  if (text.startsWith("hey, i’m sam")) {
    return text;
  }

  if (text.startsWith("perfect") || text.startsWith("nice") || text.startsWith("got it") || text.startsWith("cool")) {
    return text.replace(".", "!");
  }

  return text;
}
