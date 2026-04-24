import {
	addIngredient,
	DEFAULT_INGREDIENTS,
	removeIngredient,
	setIngredientGrams,
	setIngredientName,
	setIngredientPercentage,
} from "@/bll/ingredientUtils";
import type { Ingredient, Recipe } from "@/types/recipe";

export type FormState = {
	name: string;
	ballWeight: string;
	ingredients: Ingredient[];
};

export type FormAction =
	| { type: "SET_NAME"; value: string }
	| { type: "SET_BALL_WEIGHT"; value: string }
	| { type: "UPDATE_GRAMS"; id: string; raw: string }
	| { type: "UPDATE_PERCENTAGE"; id: string; raw: string }
	| { type: "UPDATE_NAME"; id: string; value: string }
	| { type: "ADD_INGREDIENT" }
	| { type: "REMOVE_INGREDIENT"; id: string };

export const initialFormState = (initial?: Recipe): FormState => ({
	name: initial?.name ?? "",
	ballWeight: initial?.ballWeight?.toString() ?? "280",
	ingredients: initial?.ingredients ?? DEFAULT_INGREDIENTS,
});

export const formReducer = (
	state: FormState,
	action: FormAction,
): FormState => {
	switch (action.type) {
		case "SET_NAME":
			return { ...state, name: action.value };
		case "SET_BALL_WEIGHT":
			return { ...state, ballWeight: action.value };
		case "UPDATE_GRAMS":
			return {
				...state,
				ingredients: setIngredientGrams(
					state.ingredients,
					action.id,
					action.raw,
				),
			};
		case "UPDATE_PERCENTAGE":
			return {
				...state,
				ingredients: setIngredientPercentage(
					state.ingredients,
					action.id,
					action.raw,
				),
			};
		case "UPDATE_NAME":
			return {
				...state,
				ingredients: setIngredientName(
					state.ingredients,
					action.id,
					action.value,
				),
			};
		case "ADD_INGREDIENT":
			return { ...state, ingredients: addIngredient(state.ingredients) };
		case "REMOVE_INGREDIENT":
			return {
				...state,
				ingredients: removeIngredient(state.ingredients, action.id),
			};
	}
};
