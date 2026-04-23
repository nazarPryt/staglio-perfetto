import { create } from "zustand";
import type { PersistStorage, StorageValue } from "zustand/middleware";
import { persist } from "zustand/middleware";
import { loadRecipes, saveRecipes } from "@/dal/storage";
import type { Recipe } from "@/types/recipe";

type RecipeStore = {
	recipes: Recipe[];
	addRecipe: (recipe: Recipe) => void;
	updateRecipe: (recipe: Recipe) => void;
	deleteRecipe: (id: string) => void;
};

type PersistedState = Pick<RecipeStore, "recipes">;

const dalStorage: PersistStorage<PersistedState> = {
	getItem: async (_key): Promise<StorageValue<PersistedState> | null> => {
		const recipes = await loadRecipes();
		return { state: { recipes }, version: 0 };
	},
	setItem: async (_key, value): Promise<void> => {
		await saveRecipes(value.state.recipes);
	},
	removeItem: async (_key): Promise<void> => {
		await saveRecipes([]);
	},
};

export const useRecipeStore = create<RecipeStore>()(
	persist(
		(set) => ({
			recipes: [],
			addRecipe: (recipe) =>
				set((state) => ({ recipes: [...state.recipes, recipe] })),
			updateRecipe: (recipe) =>
				set((state) => ({
					recipes: state.recipes.map((r) => (r.id === recipe.id ? recipe : r)),
				})),
			deleteRecipe: (id) =>
				set((state) => ({
					recipes: state.recipes.filter((r) => r.id !== id),
				})),
		}),
		{
			name: "recipes",
			storage: dalStorage,
			partialize: (state) => ({ recipes: state.recipes }),
		},
	),
);
