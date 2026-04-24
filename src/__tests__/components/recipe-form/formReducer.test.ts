import { DEFAULT_INGREDIENTS } from "@/bll/ingredientUtils";
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
