import { calcByCount, calcByFlour } from "@/bll/calculations";
import type { Recipe } from "@/types/recipe";

const recipe: Recipe = {
	id: "1",
	name: "Neapolitan",
	ballWeight: 280,
	ingredients: [
		{ id: "1", name: "Water", grams: 650 },
		{ id: "2", name: "Salt", grams: 25 },
		{ id: "3", name: "Yeast", grams: 3 },
	],
	createdAt: 0,
};

describe("calcByCount", () => {
	test("total dough grams equals ballCount × ballWeight", () => {
		const result = calcByCount(recipe, 8);
		expect(result.totalDoughGrams).toBe(2240);
	});

	test("flour grams is back-calculated from total dough", () => {
		const result = calcByCount(recipe, 8);
		expect(result.flourGrams).toBeCloseTo(1334.9, 0);
	});

	test("water grams is flour × water ratio", () => {
		const result = calcByCount(recipe, 8);
		// biome-ignore lint/style/noNonNullAssertion: test fixture
		const water = result.ingredients.find((i) => i.name === "Water")!;
		expect(water.grams).toBeCloseTo(867.7, 0);
		expect(water.percentage).toBe(65);
	});

	test("salt percentage is correct", () => {
		const result = calcByCount(recipe, 8);
		// biome-ignore lint/style/noNonNullAssertion: test fixture
		const salt = result.ingredients.find((i) => i.name === "Salt")!;
		expect(salt.percentage).toBe(2.5);
	});

	test("returns zero values for 0 balls", () => {
		const result = calcByCount(recipe, 0);
		expect(result.flourGrams).toBe(0);
		expect(result.totalDoughGrams).toBe(0);
		// biome-ignore lint/suspicious/useIterableCallbackReturn: test assertion
		result.ingredients.forEach((i) => expect(i.grams).toBe(0));
	});
});

describe("calcByFlour", () => {
	test("ball count is floored for 1 kg flour", () => {
		const result = calcByFlour(recipe, 1);
		expect(result.ballCount).toBe(5);
	});

	test("water grams equals recipe water for 1 kg flour", () => {
		const result = calcByFlour(recipe, 1);
		// biome-ignore lint/style/noNonNullAssertion: test fixture
		const water = result.ingredients.find((i) => i.name === "Water")!;
		expect(water.grams).toBe(650);
		expect(water.percentage).toBe(65);
	});

	test("ball count for 10 kg flour", () => {
		const result = calcByFlour(recipe, 10);
		expect(result.ballCount).toBe(59);
	});

	test("total dough grams for 1 kg flour", () => {
		const result = calcByFlour(recipe, 1);
		expect(result.totalDoughGrams).toBe(1678);
	});
});
