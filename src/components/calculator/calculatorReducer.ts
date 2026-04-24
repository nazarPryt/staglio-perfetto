import type { Mode, Recipe } from "@/types/recipe";

export type CalculatorState = {
	selectedId: string;
	mode: Mode;
	inputValue: string;
};

export type CalculatorAction =
	| { type: "SELECT_RECIPE"; id: string }
	| { type: "SET_MODE"; mode: Mode }
	| { type: "SET_INPUT"; value: string };

export const initialCalculatorState = (recipes: Recipe[]): CalculatorState => ({
	selectedId: recipes[0]?.id ?? "",
	mode: "by-count",
	inputValue: "",
});

export const calculatorReducer = (
	state: CalculatorState,
	action: CalculatorAction,
): CalculatorState => {
	switch (action.type) {
		case "SELECT_RECIPE":
			return { ...state, selectedId: action.id, inputValue: "" };
		case "SET_MODE":
			return { ...state, mode: action.mode, inputValue: "" };
		case "SET_INPUT":
			return { ...state, inputValue: action.value };
	}
};
