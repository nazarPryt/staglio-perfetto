import {
	addIngredient,
	DEFAULT_INGREDIENTS,
	removeIngredient,
	setIngredientGrams,
	setIngredientName,
	setIngredientPercentage,
	setIngredientType,
} from "@/bll/ingredientUtils";
import type {
	DoughMethod,
	Ingredient,
	IngredientType,
	Recipe,
} from "@/types/recipe";

export type FormState = {
	name: string;
	ballWeight: string;
	ingredients: Ingredient[];
	doughMethod: DoughMethod;
	prefermentFlourPct: string;
	prefermentHydration: string;
	bigaYeastPercentOnBigaFlour: string;
	autolyseWaterPct: string;
};

export type FormAction =
	| { type: "SET_NAME"; value: string }
	| { type: "SET_BALL_WEIGHT"; value: string }
	| { type: "UPDATE_GRAMS"; id: string; raw: string }
	| { type: "UPDATE_PERCENTAGE"; id: string; raw: string }
	| { type: "UPDATE_NAME"; id: string; value: string }
	| { type: "UPDATE_TYPE"; id: string; ingredientType: IngredientType }
	| { type: "ADD_INGREDIENT" }
	| { type: "REMOVE_INGREDIENT"; id: string }
	| { type: "SET_DOUGH_METHOD"; method: DoughMethod }
	| { type: "SET_PREFERMENT_FLOUR_PCT"; value: string }
	| { type: "SET_PREFERMENT_HYDRATION"; value: string }
	| { type: "SET_BIGA_YEAST_PCT"; value: string }
	| { type: "SET_AUTOLYSE_WATER_PCT"; value: string };

export const initialFormState = (initial?: Recipe): FormState => ({
	name: initial?.name ?? "",
	ballWeight: initial?.ballWeight?.toString() ?? "280",
	ingredients: initial?.ingredients ?? DEFAULT_INGREDIENTS,
	doughMethod: initial?.doughMethod ?? "direct",
	prefermentFlourPct: (initial?.prefermentFlourPct ?? 40).toString(),
	prefermentHydration: (initial?.prefermentHydration ?? 45).toString(),
	bigaYeastPercentOnBigaFlour: (
		initial?.bigaYeastPercentOnBigaFlour ?? 0.2
	).toString(),
	autolyseWaterPct: (initial?.autolyseWaterPct ?? 100).toString(),
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
		case "UPDATE_TYPE":
			return {
				...state,
				ingredients: setIngredientType(
					state.ingredients,
					action.id,
					action.ingredientType,
				),
			};
		case "ADD_INGREDIENT":
			return { ...state, ingredients: addIngredient(state.ingredients) };
		case "REMOVE_INGREDIENT":
			return {
				...state,
				ingredients: removeIngredient(state.ingredients, action.id),
			};
		case "SET_DOUGH_METHOD":
			return { ...state, doughMethod: action.method };
		case "SET_PREFERMENT_FLOUR_PCT":
			return { ...state, prefermentFlourPct: action.value };
		case "SET_PREFERMENT_HYDRATION":
			return { ...state, prefermentHydration: action.value };
		case "SET_BIGA_YEAST_PCT":
			return { ...state, bigaYeastPercentOnBigaFlour: action.value };
		case "SET_AUTOLYSE_WATER_PCT":
			return { ...state, autolyseWaterPct: action.value };
	}
};
