import { DEFAULT_INGREDIENTS, setIngredientType } from "@/bll/ingredientUtils";
import {
	type FormState,
	formReducer,
	initialFormState,
} from "@/components/recipe-form/formReducer";

const state: FormState = initialFormState();

describe("initialFormState", () => {
	test("defaults to empty name and 280g ball weight", () => {
		expect(state.name).toBe("");
		expect(state.ballWeight).toBe("280");
	});

	test("uses default ingredients when no initial recipe", () => {
		expect(state.ingredients).toEqual(DEFAULT_INGREDIENTS);
	});

	test("uses provided recipe values", () => {
		const s = initialFormState({
			id: "1",
			name: "Neapolitan",
			ballWeight: 300,
			ingredients: [],
			createdAt: 0,
		});
		expect(s.name).toBe("Neapolitan");
		expect(s.ballWeight).toBe("300");
		expect(s.ingredients).toEqual([]);
	});
});

describe("formReducer", () => {
	test("SET_NAME updates name", () => {
		const next = formReducer(state, { type: "SET_NAME", value: "Romana" });
		expect(next.name).toBe("Romana");
	});

	test("SET_BALL_WEIGHT updates ballWeight", () => {
		const next = formReducer(state, { type: "SET_BALL_WEIGHT", value: "320" });
		expect(next.ballWeight).toBe("320");
	});

	test("UPDATE_GRAMS updates matching ingredient grams", () => {
		const next = formReducer(state, {
			type: "UPDATE_GRAMS",
			id: "salt",
			raw: "30",
		});
		expect(next.ingredients.find((i) => i.id === "salt")?.grams).toBe(30);
	});

	test("UPDATE_PERCENTAGE converts pct to grams", () => {
		const next = formReducer(state, {
			type: "UPDATE_PERCENTAGE",
			id: "water",
			raw: "70",
		});
		expect(next.ingredients.find((i) => i.id === "water")?.grams).toBe(700);
	});

	test("UPDATE_NAME updates matching ingredient name", () => {
		const next = formReducer(state, {
			type: "UPDATE_NAME",
			id: "yeast",
			value: "Dry Yeast",
		});
		expect(next.ingredients.find((i) => i.id === "yeast")?.name).toBe(
			"Dry Yeast",
		);
	});

	test("ADD_INGREDIENT appends one empty ingredient", () => {
		const next = formReducer(state, { type: "ADD_INGREDIENT" });
		expect(next.ingredients).toHaveLength(state.ingredients.length + 1);
		const added = next.ingredients[next.ingredients.length - 1];
		expect(added.name).toBe("");
		expect(added.grams).toBe(0);
	});

	test("REMOVE_INGREDIENT removes matching ingredient", () => {
		const next = formReducer(state, {
			type: "REMOVE_INGREDIENT",
			id: "salt",
		});
		expect(next.ingredients.find((i) => i.id === "salt")).toBeUndefined();
	});

	test("does not mutate original state", () => {
		const original = { ...state, ingredients: [...state.ingredients] };
		formReducer(state, { type: "SET_NAME", value: "Changed" });
		expect(state.name).toBe(original.name);
	});
});

describe("initialFormState — dough method defaults", () => {
	test("defaults doughMethod to direct", () => {
		expect(state.doughMethod).toBe("direct");
	});

	test("defaults prefermentFlourPct to 40", () => {
		expect(state.prefermentFlourPct).toBe("40");
	});

	test("defaults prefermentHydration to 45", () => {
		expect(state.prefermentHydration).toBe("45");
	});

	test("defaults bigaYeastPercentOnBigaFlour to 0.2", () => {
		expect(state.bigaYeastPercentOnBigaFlour).toBe("0.2");
	});

	test("defaults autolyseWaterPct to 100", () => {
		expect(state.autolyseWaterPct).toBe("100");
	});

	test("reads doughMethod and params from initial recipe", () => {
		const s = initialFormState({
			id: "1",
			name: "Biga Pizza",
			ballWeight: 300,
			ingredients: [],
			createdAt: 0,
			doughMethod: "biga",
			prefermentFlourPct: 35,
			prefermentHydration: 50,
		});
		expect(s.doughMethod).toBe("biga");
		expect(s.prefermentFlourPct).toBe("35");
		expect(s.prefermentHydration).toBe("50");
	});
});

describe("formReducer — dough method actions", () => {
	test("SET_DOUGH_METHOD updates doughMethod", () => {
		const next = formReducer(state, { type: "SET_DOUGH_METHOD", method: "biga" });
		expect(next.doughMethod).toBe("biga");
	});

	test("SET_PREFERMENT_FLOUR_PCT updates prefermentFlourPct", () => {
		const next = formReducer(state, { type: "SET_PREFERMENT_FLOUR_PCT", value: "50" });
		expect(next.prefermentFlourPct).toBe("50");
	});

	test("SET_PREFERMENT_HYDRATION updates prefermentHydration", () => {
		const next = formReducer(state, { type: "SET_PREFERMENT_HYDRATION", value: "50" });
		expect(next.prefermentHydration).toBe("50");
	});

	test("SET_BIGA_YEAST_PCT updates bigaYeastPercentOnBigaFlour", () => {
		const next = formReducer(state, { type: "SET_BIGA_YEAST_PCT", value: "0.3" });
		expect(next.bigaYeastPercentOnBigaFlour).toBe("0.3");
	});

	test("SET_AUTOLYSE_WATER_PCT updates autolyseWaterPct", () => {
		const next = formReducer(state, { type: "SET_AUTOLYSE_WATER_PCT", value: "80" });
		expect(next.autolyseWaterPct).toBe("80");
	});

	test("UPDATE_TYPE updates type on matching ingredient", () => {
		const withCustom = formReducer(state, { type: "ADD_INGREDIENT" });
		const customId = withCustom.ingredients[withCustom.ingredients.length - 1].id;
		const next = formReducer(withCustom, {
			type: "UPDATE_TYPE",
			id: customId,
			ingredientType: "water",
		});
		expect(next.ingredients.find((i) => i.id === customId)?.type).toBe("water");
	});
});
