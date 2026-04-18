// FooDB (https://foodb.ca) is a public food / compound database.
// This wrapper returns mock nutrition + bioactive compound data for an ingredient.
// Replace the mock with a real call:
//   const res = await fetch(`https://foodb.ca/api/foods/search?q=${encodeURIComponent(name)}`)
// FooDB public API is read-only and CORS-limited; production clients should proxy.

const MOCK = {
  "Rotisserie chicken": {
    foodbId: "FOOD00093",
    per100g: { kcal: 189, protein: 24, fat: 10, carbs: 0 },
    compounds: [
      { name: "Carnosine", role: "Muscle buffer", tag: "strength" },
      { name: "Creatine", role: "ATP support", tag: "strength" },
      { name: "B12", role: "Red blood cells", tag: "vitamin" },
    ],
    insight: "Lean protein + carnosine supports training buffering capacity.",
  },
  Cucumber: {
    foodbId: "FOOD00267",
    per100g: { kcal: 16, protein: 0.7, fat: 0.1, carbs: 3.6 },
    compounds: [
      { name: "Cucurbitacin", role: "Anti-inflammatory", tag: "phyto" },
      { name: "Silica", role: "Connective tissue", tag: "mineral" },
      { name: "Vitamin K", role: "Bone health", tag: "vitamin" },
    ],
    insight: "Low-cal hydration vehicle; pairs well with protein-heavy dishes.",
  },
  "Chili oil": {
    foodbId: "FOOD00891",
    per100g: { kcal: 820, protein: 1, fat: 90, carbs: 4 },
    compounds: [
      { name: "Capsaicin", role: "Metabolic boost", tag: "bioactive" },
      { name: "Vitamin E", role: "Antioxidant", tag: "vitamin" },
    ],
    insight: "Capsaicin may modestly increase post-meal thermogenesis.",
  },
  "Soy sauce": {
    foodbId: "FOOD00451",
    per100g: { kcal: 60, protein: 8, fat: 0.1, carbs: 5.6 },
    compounds: [
      { name: "Umami peptides", role: "Flavor", tag: "flavor" },
      { name: "Sodium", role: "Electrolyte", tag: "watch" },
    ],
    insight: "Use sparingly — high sodium density.",
  },
  Garlic: {
    foodbId: "FOOD00230",
    per100g: { kcal: 149, protein: 6.4, fat: 0.5, carbs: 33 },
    compounds: [
      { name: "Allicin", role: "Antimicrobial", tag: "bioactive" },
      { name: "Selenium", role: "Antioxidant", tag: "mineral" },
    ],
    insight: "Allicin forms when fresh garlic is crushed — let it sit 10 min.",
  },
};

export async function getFoodDetails(name, { signal } = {}) {
  // const res = await fetch(`https://foodb.ca/api/foods/search?q=${encodeURIComponent(name)}`, { signal });
  // return res.json();
  await delay(350, signal);
  return MOCK[name] || null;
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new Error("aborted"));
    });
  });
}
