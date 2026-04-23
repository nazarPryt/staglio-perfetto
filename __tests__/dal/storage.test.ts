import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadRecipes, saveRecipes } from "@/dal/storage";
import type { Recipe } from "@/types/recipe";

jest.mock("@react-native-async-storage/async-storage", () => ({
	__esModule: true,
	default: {
		getItem: jest.fn(),
		setItem: jest.fn(),
		removeItem: jest.fn(),
		getAllKeys: jest.fn(),
		multiGet: jest.fn(),
		multiSet: jest.fn(),
		multiRemove: jest.fn(),
		clear: jest.fn(),
	},
}));

const mockRecipe: Recipe = {
	id: "1",
	name: "Neapolitan",
	ballWeight: 280,
	ingredients: [
		{ id: "1", name: "Water", grams: 650 },
		{ id: "2", name: "Salt", grams: 25 },
		{ id: "3", name: "Yeast", grams: 3 },
	],
	createdAt: 1000000,
};

beforeEach(() => {
	jest.clearAllMocks();
});

test("loadRecipes returns empty array when nothing stored", async () => {
	(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
	const result = await loadRecipes();
	expect(result).toEqual([]);
});

test("loadRecipes returns parsed recipes from storage", async () => {
	(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
		JSON.stringify([mockRecipe]),
	);
	const result = await loadRecipes();
	expect(result).toEqual([mockRecipe]);
});

test("saveRecipes writes JSON string to AsyncStorage", async () => {
	await saveRecipes([mockRecipe]);
	expect(AsyncStorage.setItem).toHaveBeenCalledWith(
		"recipes",
		JSON.stringify([mockRecipe]),
	);
});

test("saveRecipes with empty array clears storage", async () => {
	await saveRecipes([]);
	expect(AsyncStorage.setItem).toHaveBeenCalledWith("recipes", "[]");
});
