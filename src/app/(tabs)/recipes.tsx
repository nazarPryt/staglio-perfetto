import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeForm } from "@/components/RecipeForm";
import { useRecipeStore } from "@/store/recipeStore";
import type { Recipe } from "@/types/recipe";
import { BUILD } from "@/version";

export default function RecipesScreen() {
	const insets = useSafeAreaInsets();
	const recipes = useRecipeStore((s) => s.recipes);
	const addRecipe = useRecipeStore((s) => s.addRecipe);
	const updateRecipe = useRecipeStore((s) => s.updateRecipe);
	const deleteRecipe = useRecipeStore((s) => s.deleteRecipe);

	const [formVisible, setFormVisible] = useState(false);
	const [editing, setEditing] = useState<Recipe | undefined>();

	function openNew() {
		setEditing(undefined);
		setFormVisible(true);
	}

	function openEdit(recipe: Recipe) {
		setEditing(recipe);
		setFormVisible(true);
	}

	function handleSave(recipe: Recipe) {
		if (editing) {
			updateRecipe(recipe);
		} else {
			addRecipe(recipe);
		}
		setFormVisible(false);
	}

	return (
		<View className="flex-1 bg-bg-screen" style={{ paddingTop: insets.top }}>
			<View className="p-4 flex-row justify-between items-center border-b border-border">
				<Text className="text-content-ghost text-xxs">build {BUILD}</Text>
				<TouchableOpacity
					className="bg-accent-blue rounded px-4.5 py-2.25"
					onPress={openNew}
					testID="new_recipe_btn"
					accessibilityLabel="new_recipe_btn"
				>
					<Text className="text-black font-bold text-sm">+ New</Text>
				</TouchableOpacity>
			</View>

			{recipes.length === 0 ? (
				<View className="flex-1 items-center justify-center">
					<Text className="text-content-faint text-base">
						No recipes yet. Tap + New to add one.
					</Text>
				</View>
			) : (
				<FlatList
					data={recipes}
					keyExtractor={(r) => r.id}
					contentContainerStyle={{ padding: 16 }}
					renderItem={({ item }) => (
						<RecipeCard
							recipe={item}
							onEdit={() => openEdit(item)}
							onDelete={() => deleteRecipe(item.id)}
						/>
					)}
				/>
			)}

			<RecipeForm
				key={editing?.id ?? "new"}
				visible={formVisible}
				initial={editing}
				onSave={handleSave}
				onClose={() => setFormVisible(false)}
			/>
		</View>
	);
}
