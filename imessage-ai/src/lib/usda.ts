import { env } from "./env.js";

type SearchResult = {
  fdcId: number;
  description: string;
  dataType?: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
};

type MatchedNutrition = {
  canonicalName: string;
  foodSourceRef: string;
  foodSource: "USDA";
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  matchScore: number;
};

export async function matchUsdaNutrition(query: string, gramsEstimated: number | null) {
  if (!env.USDA_API_KEY) {
    return null;
  }

  const searchUrl = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  searchUrl.searchParams.set("api_key", env.USDA_API_KEY);
  searchUrl.searchParams.set("query", query);
  searchUrl.searchParams.set("pageSize", "5");

  const searchResponse = await fetch(searchUrl);
  const searchJson = (await searchResponse.json()) as { foods?: SearchResult[] };

  if (!searchResponse.ok) {
    throw new Error(`USDA search failed: ${searchResponse.status}`);
  }

  const bestMatch = pickBestFood(query, searchJson.foods ?? []);

  if (!bestMatch) {
    return null;
  }

  const detailUrl = new URL(`https://api.nal.usda.gov/fdc/v1/food/${bestMatch.fdcId}`);
  detailUrl.searchParams.set("api_key", env.USDA_API_KEY);
  const detailResponse = await fetch(detailUrl);
  const detailJson = (await detailResponse.json()) as UsdaFoodDetail;

  if (!detailResponse.ok) {
    throw new Error(`USDA food detail failed: ${detailResponse.status}`);
  }

  const baseMacros = extractMacros(detailJson);

  if (!baseMacros) {
    return null;
  }

  const multiplier = getServingMultiplier(detailJson, gramsEstimated);

  return {
    canonicalName: bestMatch.description,
    foodSourceRef: String(bestMatch.fdcId),
    foodSource: "USDA" as const,
    calories: roundOne(baseMacros.calories * multiplier),
    proteinG: roundOne(baseMacros.proteinG * multiplier),
    carbsG: roundOne(baseMacros.carbsG * multiplier),
    fatG: roundOne(baseMacros.fatG * multiplier),
    fiberG: roundOne(baseMacros.fiberG * multiplier),
    matchScore: scoreTextMatch(query, bestMatch.description),
  } satisfies MatchedNutrition;
}

type UsdaFoodDetail = {
  description?: string;
  dataType?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: Array<{
    amount?: number;
    nutrient?: {
      number?: string;
      name?: string;
    };
    nutrientNumber?: string;
    value?: number;
    unitName?: string;
  }>;
};

function pickBestFood(query: string, foods: SearchResult[]) {
  const priority = ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"];

  const sorted = [...foods].sort((a, b) => {
    const aIndex = priority.findIndex((value) => a.dataType?.includes(value));
    const bIndex = priority.findIndex((value) => b.dataType?.includes(value));

    const left = aIndex === -1 ? priority.length : aIndex;
    const right = bIndex === -1 ? priority.length : bIndex;
    const leftScore = scoreTextMatch(query, a.description);
    const rightScore = scoreTextMatch(query, b.description);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return left - right;
  });

  const best = sorted[0] ?? null;

  if (!best) {
    return null;
  }

  if (scoreTextMatch(query, best.description) < 0.5) {
    return null;
  }

  return best;
}

function extractMacros(food: UsdaFoodDetail) {
  const nutrients = food.foodNutrients ?? [];

  const getNutrient = (numbers: string[], names: string[]) => {
    const entry = nutrients.find((nutrient) => {
      const nutrientNumber = nutrient.nutrient?.number ?? nutrient.nutrientNumber ?? "";
      const nutrientName = nutrient.nutrient?.name?.toLowerCase() ?? "";

      return numbers.includes(nutrientNumber) || names.some((name) => nutrientName.includes(name));
    });

    return entry?.amount ?? entry?.value ?? 0;
  };

  return {
    calories: getNutrient(["208"], ["energy"]),
    proteinG: getNutrient(["203"], ["protein"]),
    carbsG: getNutrient(["205"], ["carbohydrate"]),
    fatG: getNutrient(["204"], ["fat"]),
    fiberG: getNutrient(["291"], ["fiber"]),
  };
}

function getServingMultiplier(food: UsdaFoodDetail, gramsEstimated: number | null) {
  if (!gramsEstimated || gramsEstimated <= 0) {
    return 1;
  }

  if (food.dataType?.toLowerCase().includes("branded") && food.servingSize && food.servingSize > 0) {
    return gramsEstimated / food.servingSize;
  }

  return gramsEstimated / 100;
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function scoreTextMatch(query: string, candidate: string) {
  const queryTokens = tokenize(query);
  const candidateTokens = tokenize(candidate);
  const requiredTokens = extractRequiredTokens(queryTokens);

  if (queryTokens.size === 0 || candidateTokens.size === 0) {
    return 0;
  }

  let overlap = 0;

  for (const token of queryTokens) {
    if (candidateTokens.has(token)) {
      overlap += 1;
    }
  }

  const missingRequiredTokens = requiredTokens.filter((token) => !candidateTokens.has(token));
  const requiredCoverage =
    requiredTokens.length === 0
      ? 1
      : requiredTokens.filter((token) => candidateTokens.has(token)).length / requiredTokens.length;

  return Math.max(overlap / queryTokens.size + requiredCoverage * 0.3 - missingRequiredTokens.length * 0.2, 0);
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

function extractRequiredTokens(tokens: Set<string>) {
  const priorityTokens = new Set([
    "small",
    "medium",
    "large",
    "combo",
    "meal",
    "fried",
    "grilled",
    "crispy",
    "spicy",
    "deluxe",
    "double",
    "single",
    "regular",
  ]);

  return [...tokens].filter((token) => priorityTokens.has(token));
}
