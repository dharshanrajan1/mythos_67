export type MealExtractionRequest = {
  text: string;
  imageUrls: string[];
};

export async function extractMealFromMessage(_input: MealExtractionRequest) {
  throw new Error("Not implemented");
}
