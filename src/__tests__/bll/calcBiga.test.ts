import { calcBiga } from "@/bll/calculations";
import type { CalcError, Recipe, TwoStepDoughResult } from "@/types/recipe";

const recipe: Recipe = {
	id: "r1",
	name: "Biga Pizza",
	ballWeight: 280,
	doughMethod: "biga",
	prefermentFlourPct: 40,
	prefermentHydration: 45,
	bigaYeastPercentOnBigaFlour: 0.2,
	ingredients: [
		{ id: "water", name: "Water", grams: 650, type: "water" },
		{ id: "salt", name: "Salt", grams: 25, type: "salt" },
		{ id: "yeast", name: "Yeast", grams: 3, type: "yeast" },
	],
	createdAt: 0,
};

// totalFlour = 1000g
// bigaFlour = 400, finalFlour = 600
// totalWater = 650, bigaWater = 180, finalWater = 470
// totalYeast = 3, bigaYeast = 0.8, finalYeast = 2.2
// saltGrams = 25, step1.totalGrams = 580.8

describe("calcBiga", () => {
	test("returns kind two-step", () => {
		const result = calcBiga(recipe, 1000);
		expect(result.kind).toBe("two-step");
	});

	test("step1Label is Biga", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1Label).toBe("Biga");
	});

	test("step1 flourGrams is prefermentFlourPct of totalFlour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.flourGrams).toBe(400);
	});

	test("step2 flourGrams is remaining flour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step2.flourGrams).toBe(600);
	});

	test("flour closure: step1.flourGrams + step2.flourGrams = totalFlour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.flourGrams + result.step2.flourGrams).toBeCloseTo(1000);
	});

	test("water closure: step1.totalWaterGrams + step2.totalWaterGrams = total water", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.totalWaterGrams + result.step2.totalWaterGrams).toBeCloseTo(650);
	});

	test("yeast closure: biga yeast + final yeast = total yeast", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		const bigaYeast = result.step1.ingredients.find((i) => i.type === "yeast")?.grams ?? 0;
		const finalYeast = result.step2.ingredients.find((i) => i.type === "yeast")?.grams ?? 0;
		expect(bigaYeast + finalYeast).toBeCloseTo(3);
	});

	test("step1 flourBase equals bigaFlour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step1.flourBase).toBe(400);
	});

	test("step2 flourBase equals totalFlour", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.step2.flourBase).toBe(1000);
	});

	test("step2 has Biga preferment ingredient", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		const biga = result.step2.ingredients.find((i) => i.source === "preferment");
		expect(biga).toBeDefined();
		expect(biga?.name).toBe("Biga");
		expect(biga?.grams).toBeCloseTo(580.8, 0);
	});

	test("totalDoughGrams equals flour + water + yeast + salt", () => {
		const result = calcBiga(recipe, 1000) as TwoStepDoughResult;
		expect(result.totalDoughGrams).toBeCloseTo(1678, 0);
	});

	test("returns error when bigaWater exceeds totalWater", () => {
		const r = { ...recipe, prefermentHydration: 200 };
		const result = calcBiga(r, 1000);
		expect(result.kind).toBe("error");
		expect((result as CalcError).message).toMatch(/hydration/i);
	});

	test("returns error when bigaYeast exceeds totalYeast", () => {
		const r = { ...recipe, bigaYeastPercentOnBigaFlour: 5 };
		const result = calcBiga(r, 1000);
		expect(result.kind).toBe("error");
		expect((result as CalcError).message).toMatch(/yeast/i);
	});
});