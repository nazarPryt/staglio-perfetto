import { calcResult, calcResultHeader } from "@/bll/calculatorUtils";
import type { Recipe, SingleDoughResult } from "@/types/recipe";

const recipe: Recipe = {
	id: "1",
	name: "Neapolitan",
	ballWeight: 280,
	ingredients: [
		{ id: "water", name: "Water", grams: 650 },
		{ id: "salt", name: "Salt", grams: 25 },
		{ id: "yeast", name: "Yeast", grams: 3 },
	],
	createdAt: 0,
};

describe("calcResult", () => {
	test("returns null for empty input", () => {
		expect(calcResult(recipe, "by-count", "")).toBeNull();
	});

	test("returns null for zero", () => {
		expect(calcResult(recipe, "by-count", "0")).toBeNull();
	});

	test("returns null for negative value", () => {
		expect(calcResult(recipe, "by-count", "-1")).toBeNull();
	});

	test("by-count returns totalDoughGrams = balls × ballWeight", () => {
		const result = calcResult(recipe, "by-count", "8") as SingleDoughResult;
		expect(result.totalDoughGrams).toBe(2240);
	});

	test("by-flour returns ball count for 1 kg", () => {
		const result = calcResult(recipe, "by-flour", "1") as SingleDoughResult;
		expect(result.ballCount).toBe(5);
	});
});

describe("calcResultHeader", () => {
	test("by-count shows balls × weight = total", () => {
		const result = calcResult(recipe, "by-count", "8") as SingleDoughResult;
		const header = calcResultHeader(result, "by-count", recipe, "8");
		expect(header).toBe("8 balls × 280g = 2240g total dough");
	});

	test("by-flour shows ball count and total dough", () => {
		const result = calcResult(recipe, "by-flour", "1") as SingleDoughResult;
		const header = calcResultHeader(result, "by-flour", recipe, "1");
		expect(header).toBe("5 balls · 1678g total dough");
	});
});
