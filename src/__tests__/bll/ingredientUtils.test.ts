import {
	addIngredient,
	calcTotalDough,
	removeIngredient,
	setIngredientGrams,
	setIngredientName,
	setIngredientPercentage,
} from "@/bll/ingredientUtils";
import type { Ingredient } from "@/types/recipe";

const base: Ingredient[] = [
	{ id: "water", name: "Water", grams: 650 },
	{ id: "salt", name: "Salt", grams: 25 },
	{ id: "yeast", name: "Yeast", grams: 3 },
];

describe("setIngredientGrams", () => {
	test("updates grams for matching id", () => {
		const result = setIngredientGrams(base, "salt", "30");
		expect(result.find((i) => i.id === "salt")?.grams).toBe(30);
	});

	test("leaves other ingredients unchanged", () => {
		const result = setIngredientGrams(base, "salt", "30");
		expect(result.find((i) => i.id === "water")?.grams).toBe(650);
	});

	test("defaults to 0 for non-numeric input", () => {
		const result = setIngredientGrams(base, "salt", "abc");
		expect(result.find((i) => i.id === "salt")?.grams).toBe(0);
	});
});

describe("setIngredientPercentage", () => {
	test("converts percentage to grams (pct × 10)", () => {
		const result = setIngredientPercentage(base, "water", "65");
		expect(result.find((i) => i.id === "water")?.grams).toBe(650);
	});

	test("defaults to 0 grams for non-numeric input", () => {
		const result = setIngredientPercentage(base, "water", "");
		expect(result.find((i) => i.id === "water")?.grams).toBe(0);
	});
});

describe("setIngredientName", () => {
	test("updates name for matching id", () => {
		const result = setIngredientName(base, "yeast", "Dry Yeast");
		expect(result.find((i) => i.id === "yeast")?.name).toBe("Dry Yeast");
	});

	test("leaves other ingredients unchanged", () => {
		const result = setIngredientName(base, "yeast", "Dry Yeast");
		expect(result.find((i) => i.id === "water")?.name).toBe("Water");
	});
});

describe("addIngredient", () => {
	test("appends one ingredient", () => {
		const result = addIngredient(base);
		expect(result).toHaveLength(base.length + 1);
	});

	test("new ingredient has empty name and zero grams", () => {
		const result = addIngredient(base);
		const added = result[result.length - 1];
		expect(added.name).toBe("");
		expect(added.grams).toBe(0);
	});

	test("new ingredient has a non-empty id", () => {
		const result = addIngredient(base);
		expect(result[result.length - 1].id).toBeTruthy();
	});

	test("does not mutate the original array", () => {
		addIngredient(base);
		expect(base).toHaveLength(3);
	});
});

describe("removeIngredient", () => {
	test("removes ingredient with matching id", () => {
		const result = removeIngredient(base, "salt");
		expect(result.find((i) => i.id === "salt")).toBeUndefined();
	});

	test("keeps remaining ingredients", () => {
		const result = removeIngredient(base, "salt");
		expect(result).toHaveLength(2);
	});

	test("no-op for unknown id", () => {
		const result = removeIngredient(base, "unknown");
		expect(result).toHaveLength(base.length);
	});
});

describe("calcTotalDough", () => {
	test("adds 1000g flour to all ingredient grams", () => {
		expect(calcTotalDough(base)).toBe(1678);
	});

	test("returns 1000 for empty ingredients", () => {
		expect(calcTotalDough([])).toBe(1000);
	});
});
