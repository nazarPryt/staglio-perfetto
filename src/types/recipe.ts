export type DoughMethod = "direct" | "biga" | "autolyse";
export type IngredientType = "water" | "yeast" | "salt" | "other";

export type Ingredient = {
	id: string;
	name: string;
	grams: number;
	type?: IngredientType;
};

export type Recipe = {
	id: string;
	name: string;
	ballWeight: number;
	ingredients: Ingredient[];
	createdAt: number;
	doughMethod?: DoughMethod;
	prefermentFlourPct?: number;
	prefermentHydration?: number;
	bigaYeastPercentOnBigaFlour?: number;
	autolyseWaterPct?: number;
};

export type IngredientResult = {
	name: string;
	grams: number;
	percentage: number;
	type?: IngredientType;
	source?: "base" | "preferment";
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

export type StepIngredients = {
	flourBase: number;
	flourGrams: number;
	totalFlourGrams: number;
	totalWaterGrams: number;
	totalGrams: number;
	ingredients: IngredientResult[];
};

export type SingleDoughResult = {
	kind: "single";
	flourGrams: number;
	totalDoughGrams: number;
	ballCount?: number;
	ingredients: IngredientResult[];
};

export type TwoStepDoughResult = {
	kind: "two-step";
	step1Label: string;
	totalFlourGrams: number;
	totalDoughGrams: number;
	ballCount?: number;
	step1: StepIngredients;
	step2: StepIngredients;
};

export type CalcError = { kind: "error"; message: string };

export type DoughCalcResult =
	| SingleDoughResult
	| TwoStepDoughResult
	| CalcError;

export type Mode = "by-count" | "by-flour";
