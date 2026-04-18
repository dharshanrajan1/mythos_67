import { env } from "./env.js";
let cachedToken = null;
export async function matchFatSecretNutrition(query, gramsEstimated) {
    if (!env.FATSECRET_CLIENT_ID || !env.FATSECRET_CLIENT_SECRET) {
        return null;
    }
    const token = await getFatSecretAccessToken();
    const response = await fetch("https://platform.fatsecret.com/rest/server.api", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            method: "foods.search.v2",
            search_expression: query,
            format: "json",
            max_results: "5",
        }),
    });
    const raw = (await response.json());
    if (!response.ok) {
        throw new Error(`FatSecret search failed: ${response.status}`);
    }
    const foods = normalizeFoods(raw);
    const best = pickBestFatSecretFood(query, foods);
    if (!best) {
        return null;
    }
    const serving = pickServing(best, gramsEstimated);
    if (!serving) {
        return null;
    }
    if (!hasCoreMacroData(serving)) {
        return null;
    }
    const servingGrams = getServingGrams(serving);
    const multiplier = gramsEstimated && servingGrams && servingGrams > 0 ? gramsEstimated / servingGrams : 1;
    return {
        canonicalName: formatFatSecretName(best),
        foodSourceRef: String(best.food_id),
        foodSource: "BRANDED",
        calories: roundOne(numberValue(serving.calories) * multiplier),
        proteinG: roundOne(numberValue(serving.protein) * multiplier),
        carbsG: roundOne(numberValue(serving.carbohydrate) * multiplier),
        fatG: roundOne(numberValue(serving.fat) * multiplier),
        fiberG: roundOne(numberValue(serving.fiber) * multiplier),
        matchScore: analyzeTextMatch(query, formatFatSecretName(best)).score,
        servingGrams,
    };
}
async function getFatSecretAccessToken() {
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now + 60_000) {
        return cachedToken.accessToken;
    }
    const response = await fetch("https://oauth.fatsecret.com/connect/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${env.FATSECRET_CLIENT_ID}:${env.FATSECRET_CLIENT_SECRET}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            scope: "basic",
        }),
    });
    const raw = (await response.json());
    if (!response.ok || !raw.access_token || !raw.expires_in) {
        throw new Error(`FatSecret token request failed: ${response.status}`);
    }
    cachedToken = {
        accessToken: raw.access_token,
        expiresAt: now + raw.expires_in * 1000,
    };
    return cachedToken.accessToken;
}
function normalizeFoods(raw) {
    const food = raw.foods?.food;
    if (!food) {
        return [];
    }
    return Array.isArray(food) ? food : [food];
}
function pickBestFatSecretFood(query, foods) {
    const ranked = [...foods].sort((left, right) => {
        const leftScore = analyzeTextMatch(query, formatFatSecretName(left)).score + (left.food_type === "Brand" ? 0.1 : 0);
        const rightScore = analyzeTextMatch(query, formatFatSecretName(right)).score + (right.food_type === "Brand" ? 0.1 : 0);
        return rightScore - leftScore;
    });
    const best = ranked[0] ?? null;
    if (!best) {
        return null;
    }
    const analysis = analyzeTextMatch(query, formatFatSecretName(best));
    if (analysis.missingRequiredTokens.length > 0 || analysis.score < 0.6) {
        return null;
    }
    return best;
}
function pickServing(food, gramsEstimated) {
    const serving = food.servings?.serving;
    const servings = !serving ? [] : Array.isArray(serving) ? serving : [serving];
    if (servings.length === 0) {
        return null;
    }
    if (!gramsEstimated) {
        return servings[0];
    }
    const withMetrics = servings
        .map((entry) => ({
        entry,
        grams: entry.metric_serving_unit === "g" ? numberValue(entry.metric_serving_amount) : null,
    }))
        .filter((entry) => entry.grams && entry.grams > 0);
    if (withMetrics.length === 0) {
        return servings[0];
    }
    withMetrics.sort((left, right) => Math.abs((left.grams ?? 0) - gramsEstimated) - Math.abs((right.grams ?? 0) - gramsEstimated));
    return withMetrics[0]?.entry ?? servings[0];
}
function getServingGrams(serving) {
    if (serving.metric_serving_unit === "g") {
        return numberValue(serving.metric_serving_amount);
    }
    return null;
}
function formatFatSecretName(food) {
    return food.brand_name ? `${food.brand_name} ${food.food_name}` : food.food_name;
}
function analyzeTextMatch(query, candidate) {
    const queryTokens = tokenize(query);
    const candidateTokens = tokenize(candidate);
    const requiredTokens = extractRequiredTokens(queryTokens);
    if (queryTokens.size === 0 || candidateTokens.size === 0) {
        return {
            score: 0,
            missingRequiredTokens: [],
            matchedRequiredTokens: [],
        };
    }
    let overlap = 0;
    for (const token of queryTokens) {
        if (candidateTokens.has(token)) {
            overlap += 1;
        }
    }
    const missingRequiredTokens = requiredTokens.filter((token) => !candidateTokens.has(token));
    const matchedRequiredTokens = requiredTokens.filter((token) => candidateTokens.has(token));
    const overlapScore = overlap / queryTokens.size;
    const requiredCoverage = requiredTokens.length === 0 ? 1 : matchedRequiredTokens.length / requiredTokens.length;
    const missingPenalty = missingRequiredTokens.length * 0.2;
    return {
        score: Math.max(overlapScore + requiredCoverage * 0.35 - missingPenalty, 0),
        missingRequiredTokens,
        matchedRequiredTokens,
    };
}
function tokenize(value) {
    return new Set(value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 1));
}
function numberValue(value) {
    return value ? Number(value) : 0;
}
function roundOne(value) {
    return Math.round(value * 10) / 10;
}
function extractRequiredTokens(tokens) {
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
function hasCoreMacroData(serving) {
    return (serving.calories !== undefined &&
        serving.protein !== undefined &&
        serving.carbohydrate !== undefined &&
        serving.fat !== undefined);
}
