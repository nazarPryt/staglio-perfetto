import {
	type CalculatorState,
	calculatorReducer,
	initialCalculatorState,
} from "@/components/calculator/calculatorReducer";
import type { Recipe } from "@/types/recipe";

const recipes: Recipe[] = [
	{
		id: "r1",
		name: "Neapolitan",
		ballWeight: 280,
		ingredients: [],
		createdAt: 0,
	},
	{
		id: "r2",
		name: "Romana",
		ballWeight: 300,
		ingredients: [],
		createdAt: 0,
	},
];

const state: CalculatorState = initialCalculatorState(recipes);

describe("initialCalculatorState", () => {
	test("selects first recipe id", () => {
		expect(state.selectedId).toBe("r1");
	});

	test("defaults to by-count mode", () => {
		expect(state.mode).toBe("by-count");
	});

	test("starts with empty input", () => {
		expect(state.inputValue).toBe("");
	});

	test("selectedId is empty string when no recipes", () => {
		expect(initialCalculatorState([]).selectedId).toBe("");
	});
});

describe("calculatorReducer", () => {
	test("SELECT_RECIPE updates selectedId and clears input", () => {
		const withInput = { ...state, inputValue: "5" };
		const next = calculatorReducer(withInput, {
			type: "SELECT_RECIPE",
			id: "r2",
		});
		expect(next.selectedId).toBe("r2");
		expect(next.inputValue).toBe("");
	});

	test("SET_MODE updates mode and clears input", () => {
		const withInput = { ...state, inputValue: "3" };
		const next = calculatorReducer(withInput, {
			type: "SET_MODE",
			mode: "by-flour",
		});
		expect(next.mode).toBe("by-flour");
		expect(next.inputValue).toBe("");
	});

	test("SET_INPUT updates inputValue", () => {
		const next = calculatorReducer(state, { type: "SET_INPUT", value: "8" });
		expect(next.inputValue).toBe("8");
	});

	test("does not mutate original state", () => {
		calculatorReducer(state, { type: "SET_INPUT", value: "99" });
		expect(state.inputValue).toBe("");
	});
});
