import { generateId } from "@/lib/generateId";
import type { Ingredient } from "@/types/recipe";

export const REQUIRED_IDS = new Set(["water", "salt", "yeast"]);

export const DEFAULT_INGREDIENTS: Ingredient[] = [
	{ id: "water", name: "Water", grams: 650 },
	{ id: "salt", name: "Salt", grams: 25 },
	{ id: "yeast", name: "Yeast", grams: 3 },
];

export const setIngredientGrams = (
	ingredients: Ingredient[],
	id: string,
	raw: string,
): Ingredient[] =>
	ingredients.map((i) =>
		i.id === id ? { ...i, grams: parseFloat(raw) || 0 } : i,
	);

export const setIngredientPercentage = (
	ingredients: Ingredient[],
	id: string,
	raw: string,
): Ingredient[] => {
	const pct = parseFloat(raw) || 0;
	return ingredients.map((i) => (i.id === id ? { ...i, grams: pct * 10 } : i));
};

export const setIngredientName = (
	ingredients: Ingredient[],
	id: string,
	value: string,
): Ingredient[] =>
	ingredients.map((i) => (i.id === id ? { ...i, name: value } : i));

export const addIngredient = (ingredients: Ingredient[]): Ingredient[] => [
	...ingredients,
	{ id: generateId(), name: "", grams: 0 },
];

export const removeIngredient = (
	ingredients: Ingredient[],
	id: string,
): Ingredient[] => ingredients.filter((i) => i.id !== id);

export const calcTotalDough = (ingredients: Ingredient[]): number =>
	1000 + ingredients.reduce((sum, i) => sum + i.grams, 0);
