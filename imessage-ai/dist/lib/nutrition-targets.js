export function calculateNutritionTargets(input) {
    if (!input.age || !input.heightCm || !input.weightKg) {
        return null;
    }
    const baseConstant = input.sex === "male" ? 5 : input.sex === "female" ? -161 : -78;
    const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + baseConstant;
    const maintenanceCalories = bmr * getActivityMultiplier(input.exerciseDaysPerWeek);
    const targetCalories = input.goalType === "LOSE"
        ? maintenanceCalories - 450
        : input.goalType === "GAIN"
            ? maintenanceCalories + 250
            : maintenanceCalories;
    const proteinMultiplier = input.goalType === "LOSE" ? 2.2 : input.goalType === "GAIN" ? 1.9 : 2.0;
    const proteinG = input.weightKg * proteinMultiplier;
    const fatG = input.weightKg * 0.8;
    const remainingCalories = Math.max(targetCalories - proteinG * 4 - fatG * 9, 0);
    const carbsG = remainingCalories / 4;
    return {
        targetCalories: Math.round(targetCalories),
        targetProteinG: Math.round(proteinG),
        targetFatG: Math.round(fatG),
        targetCarbsG: Math.round(carbsG),
    };
}
function getActivityMultiplier(exerciseDaysPerWeek) {
    const days = Math.max(0, Math.min(Math.round(exerciseDaysPerWeek ?? 0), 7));
    if (days >= 7) {
        return 1.8;
    }
    if (days >= 5) {
        return 1.65;
    }
    if (days >= 3) {
        return 1.5;
    }
    if (days >= 1) {
        return 1.35;
    }
    return 1.2;
}
