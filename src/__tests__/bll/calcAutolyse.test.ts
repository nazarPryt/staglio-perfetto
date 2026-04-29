import { calcAutolyse } from "@/bll/calculations";
import type { Recipe, TwoStepDoughResult } from "@/types/recipe";

const recipe: Recipe = {
	id: "r2",
	name: "Autolyse Pizza",
	ballWeight: 280,
	doughMethod: "autolyse",
	autolyseWaterPct: 100,
	ingredients: [
		{ id: "water", name: "Water", grams: 650, type: "water" },
		{ id: "salt", name: "Salt", grams: 25, type: "salt" },
		{ id: "yeast", name: "Yeast", grams: 3, type: "yeast" },
	],
	createdAt: 0,
};

// totalFlour = 1000g, autolyseWaterPct = 100%
// totalWater = 650, autolyseWater = 650, finalWater = 0
// step1.totalGrams = 1650, totalDoughGrams = 1678

describe("calcAutolyse", () => {
	test("returns kind two-step", () => {
		const result = calcAutolyse(recipe, 1000);
		expect(result.kind).toBe("two-step");
	});

	test("step1Label is Autolyse", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1Label).toBe("Autolyse");
	});

	test("step1 flourGrams equals totalFlour", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.flourGrams).toBe(1000);
	});

	test("step1 contains all water when autolyseWaterPct is 100", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.totalWaterGrams).toBe(650);
	});

	test("step2 flourGrams is 0 (all flour in step1)", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step2.flourGrams).toBe(0);
	});

	test("step2 flourBase is totalFlour", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.step2.flourBase).toBe(1000);
	});

	test("step2 has no water ingredient when autolyseWaterPct is 100", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		const water = result.step2.ingredients.find((i) => i.type === "water");
		expect(water).toBeUndefined();
	});

	test("step2 has Autolyse preferment ingredient", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		const autolyse = result.step2.ingredients.find((i) => i.source === "preferment");
		expect(autolyse).toBeDefined();
		expect(autolyse?.name).toBe("Autolyse");
		expect(autolyse?.grams).toBeCloseTo(1650, 0);
	});

	test("partial water: step2 has remaining water when autolyseWaterPct is 80", () => {
		const r = { ...recipe, autolyseWaterPct: 80 };
		const result = calcAutolyse(r, 1000) as TwoStepDoughResult;
		// autolyseWater = 650×0.8 = 520, finalWater = 130
		const water = result.step2.ingredients.find((i) => i.type === "water");
		expect(water).toBeDefined();
		expect(water?.grams).toBeCloseTo(130, 0);
	});

	test("totalDoughGrams is consistent", () => {
		const result = calcAutolyse(recipe, 1000) as TwoStepDoughResult;
		expect(result.totalDoughGrams).toBeCloseTo(1678, 0);
	});
});