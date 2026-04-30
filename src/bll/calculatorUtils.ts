import {
	calcAutolyse,
	calcBiga,
	calcByCount,
	calcByFlour,
} from "@/bll/calculations";
import type {
	DoughCalcResult,
	Mode,
	Recipe,
	SingleDoughResult,
} from "@/types/recipe";

function deriveTotalFlour(recipe: Recipe, mode: Mode, val: number): number {
	if (mode === "by-flour") return val * 1000;
	const ingredientRatio =
		recipe.ingredients.reduce((s, i) => s + i.grams, 0) / 1000;
	return (val * recipe.ballWeight) / (1 + ingredientRatio);
}

function wrapSingle(
	recipe: Recipe,
	mode: Mode,
	val: number,
): SingleDoughResult {
	if (mode === "by-count") {
		const raw = calcByCount(recipe, val);
		return {
			kind: "single",
			flourGrams: raw.flourGrams,
			totalDoughGrams: raw.totalDoughGrams,
			ingredients: raw.ingredients,
		};
	}
	const raw = calcByFlour(recipe, val);
	return {
		kind: "single",
		flourGrams: raw.flourGrams,
		totalDoughGrams: raw.totalDoughGrams,
		ballCount: raw.ballCount,
		ingredients: raw.ingredients,
	};
}

export const calcResult = (
	recipe: Recipe,
	mode: Mode,
	inputValue: string,
): DoughCalcResult | null => {
	const val = parseFloat(inputValue);
	if (!(val > 0)) return null;

	const method = recipe.doughMethod ?? "direct";
	const totalFlour = deriveTotalFlour(recipe, mode, val);

	if (method === "biga") {
		const res = calcBiga(recipe, totalFlour);
		if (res.kind === "two-step" && mode === "by-flour") {
			return {
				...res,
				ballCount: Math.floor(res.totalDoughGrams / recipe.ballWeight),
			};
		}
		return res;
	}
	if (method === "autolyse") {
		const res = calcAutolyse(recipe, totalFlour);
		if (mode === "by-flour") {
			return {
				...res,
				ballCount: Math.floor(res.totalDoughGrams / recipe.ballWeight),
			};
		}
		return res;
	}
	return wrapSingle(recipe, mode, val);
};

export const calcResultHeader = (
	result: DoughCalcResult,
	mode: Mode,
	recipe: Recipe,
	inputValue: string,
): string => {
	if (result.kind === "error") return "";
	if (mode === "by-count") {
		const totalDough = Math.round(parseFloat(inputValue)) * recipe.ballWeight;
		return `${inputValue} balls × ${recipe.ballWeight}g = ${totalDough}g total dough`;
	}
	const ballCount = result.ballCount ?? "?";
	return `${ballCount} balls · ${result.totalDoughGrams}g total dough`;
};
