import { calcByCount, calcByFlour } from "@/bll/calculations";
import type {
	CalcByCountResult,
	CalcByFlourResult,
	Mode,
	Recipe,
} from "@/types/recipe";

export type CalcResult = CalcByCountResult | CalcByFlourResult;

export const calcResult = (
	recipe: Recipe,
	mode: Mode,
	inputValue: string,
): CalcResult | null => {
	const val = parseFloat(inputValue);
	if (!(val > 0)) return null;
	return mode === "by-count"
		? calcByCount(recipe, val)
		: calcByFlour(recipe, val);
};

export const calcResultHeader = (
	result: CalcResult,
	mode: Mode,
	recipe: Recipe,
	inputValue: string,
): string => {
	if (mode === "by-count") {
		const r = result as CalcByCountResult;
		return `${inputValue} balls × ${recipe.ballWeight}g = ${r.totalDoughGrams}g total dough`;
	}
	const r = result as CalcByFlourResult;
	return `${r.ballCount} balls · ${r.totalDoughGrams}g total dough`;
};
