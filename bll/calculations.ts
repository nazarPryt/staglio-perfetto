import type {
	CalcByCountResult,
	CalcByFlourResult,
	IngredientResult,
	Recipe,
} from "@/types/recipe";

function round1(n: number): number {
	return Math.round(n * 10) / 10;
}

function ingredientRatio(recipe: Recipe): number {
	return recipe.ingredients.reduce((sum, i) => sum + i.grams, 0) / 1000;
}

export function calcByCount(
	recipe: Recipe,
	ballCount: number,
): CalcByCountResult {
	const totalDoughGrams = ballCount * recipe.ballWeight;
	const flourGrams = totalDoughGrams / (1 + ingredientRatio(recipe));
	const ingredients: IngredientResult[] = recipe.ingredients.map((i) => ({
		name: i.name,
		grams: round1((flourGrams * i.grams) / 1000),
		percentage: i.grams / 10,
	}));
	return {
		flourGrams: round1(flourGrams),
		totalDoughGrams,
		ingredients,
	};
}

export function calcByFlour(
	recipe: Recipe,
	flourKg: number,
): CalcByFlourResult {
	const flourGrams = flourKg * 1000;
	const totalDoughGrams = round1(flourGrams * (1 + ingredientRatio(recipe)));
	const ballCount = Math.floor(totalDoughGrams / recipe.ballWeight);
	const ingredients: IngredientResult[] = recipe.ingredients.map((i) => ({
		name: i.name,
		grams: round1((flourGrams * i.grams) / 1000),
		percentage: i.grams / 10,
	}));
	return {
		ballCount,
		flourGrams,
		totalDoughGrams,
		ingredients,
	};
}
