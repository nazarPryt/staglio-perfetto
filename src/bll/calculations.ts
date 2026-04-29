import type {
	CalcByCountResult,
	CalcByFlourResult,
	CalcError,
	IngredientResult,
	IngredientType,
	Recipe,
	TwoStepDoughResult,
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

export function calcBiga(
	recipe: Recipe,
	totalFlourGrams: number,
): TwoStepDoughResult | CalcError {
	const {
		prefermentFlourPct = 40,
		prefermentHydration = 45,
		bigaYeastPercentOnBigaFlour = 0.2,
		ingredients,
	} = recipe;

	const waterIng = ingredients.find((i) => i.type === "water");
	const yeastIng = ingredients.find((i) => i.type === "yeast");
	const saltIng = ingredients.find((i) => i.type === "salt");
	const otherIngs = ingredients.filter((i) => !i.type || i.type === "other");

	const hydrationPct = waterIng ? waterIng.grams / 10 : 0;
	const yeastPct = yeastIng ? yeastIng.grams / 10 : 0;
	const saltPct = saltIng ? saltIng.grams / 10 : 0;

	const bigaFlour = round1((totalFlourGrams * prefermentFlourPct) / 100);
	const finalFlour = round1(totalFlourGrams - bigaFlour);

	const totalWater = round1((totalFlourGrams * hydrationPct) / 100);
	const bigaWater = round1((bigaFlour * prefermentHydration) / 100);
	if (bigaWater > totalWater) {
		return {
			kind: "error",
			message:
				"Biga hydration exceeds recipe hydration — lower preferment hydration or increase recipe water",
		};
	}
	const finalWater = round1(totalWater - bigaWater);

	const totalYeast = round1((totalFlourGrams * yeastPct) / 100);
	const bigaYeast = round1((bigaFlour * bigaYeastPercentOnBigaFlour) / 100);
	if (bigaYeast > totalYeast) {
		return {
			kind: "error",
			message:
				"Biga yeast exceeds total yeast — lower biga yeast % or increase recipe yeast",
		};
	}
	const finalYeast = round1(totalYeast - bigaYeast);
	const saltGrams = round1((totalFlourGrams * saltPct) / 100);

	const step1Ingredients: IngredientResult[] = [
		{
			name: waterIng?.name ?? "Water",
			grams: bigaWater,
			percentage: round1(prefermentHydration),
			type: "water",
		},
		{
			name: yeastIng?.name ?? "Yeast",
			grams: bigaYeast,
			percentage: round1(bigaYeastPercentOnBigaFlour),
			type: "yeast",
		},
	];
	const step1TotalGrams = round1(bigaFlour + bigaWater + bigaYeast);

	const step2Ingredients: IngredientResult[] = [
		{
			name: waterIng?.name ?? "Water",
			grams: finalWater,
			percentage: round1((finalWater / totalFlourGrams) * 100),
			type: "water",
		},
		{
			name: yeastIng?.name ?? "Yeast",
			grams: finalYeast,
			percentage: round1((finalYeast / totalFlourGrams) * 100),
			type: "yeast",
		},
	];
	if (saltIng) {
		step2Ingredients.push({
			name: saltIng.name,
			grams: saltGrams,
			percentage: round1(saltPct),
			type: "salt",
		});
	}
	for (const ing of otherIngs) {
		const grams = round1((totalFlourGrams * (ing.grams / 10)) / 100);
		step2Ingredients.push({
			name: ing.name,
			grams,
			percentage: round1(ing.grams / 10),
			type: "other" as IngredientType,
		});
	}
	step2Ingredients.push({
		name: "Biga",
		grams: step1TotalGrams,
		percentage: round1((step1TotalGrams / totalFlourGrams) * 100),
		source: "preferment",
		type: "other" as IngredientType,
	});

	const step2TotalGrams = round1(
		finalFlour + step2Ingredients.reduce((s, i) => s + i.grams, 0),
	);
	const otherTotal = otherIngs.reduce(
		(s, i) => s + round1((totalFlourGrams * (i.grams / 10)) / 100),
		0,
	);
	const totalDoughGrams = round1(
		totalFlourGrams + totalWater + totalYeast + saltGrams + otherTotal,
	);

	return {
		kind: "two-step",
		step1Label: "Biga",
		totalFlourGrams,
		totalDoughGrams,
		step1: {
			flourBase: bigaFlour,
			flourGrams: bigaFlour,
			totalFlourGrams: bigaFlour,
			totalWaterGrams: bigaWater,
			totalGrams: step1TotalGrams,
			ingredients: step1Ingredients,
		},
		step2: {
			flourBase: totalFlourGrams,
			flourGrams: finalFlour,
			totalFlourGrams,
			totalWaterGrams: finalWater,
			totalGrams: step2TotalGrams,
			ingredients: step2Ingredients,
		},
	};
}

