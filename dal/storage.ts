import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Recipe } from "@/types/recipe";

const STORAGE_KEY = "recipes";

export async function loadRecipes(): Promise<Recipe[]> {
	const json = await AsyncStorage.getItem(STORAGE_KEY);
	if (!json) return [];
	return JSON.parse(json) as Recipe[];
}

export async function saveRecipes(recipes: Recipe[]): Promise<void> {
	await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}
