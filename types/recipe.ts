export type Ingredient = {
	id: string;
	name: string;
	grams: number;
};

export type Recipe = {
	id: string;
	name: string;
	ballWeight: number;
	ingredients: Ingredient[];
	createdAt: number;
};

export type IngredientResult = {
	name: string;
	grams: number;
	percentage: number;
};

export type CalcByCountResult = {
	flourGrams: number;
	totalDoughGrams: number;
	ingredients: IngredientResult[];
};

export type CalcByFlourResult = {
	ballCount: number;
	flourGrams: number;
	totalDoughGrams: number;
	ingredients: IngredientResult[];
};
