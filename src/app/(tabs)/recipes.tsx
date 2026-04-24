import { useState } from "react";
import {
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeForm } from "@/components/RecipeForm";
import { useRecipeStore } from "@/store/recipeStore";
import type { Recipe } from "@/types/recipe";

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
		<View style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.headerBar}>
				<TouchableOpacity style={styles.newBtn} onPress={openNew}>
					<Text style={styles.newBtnText}>+ New</Text>
				</TouchableOpacity>
			</View>

			{recipes.length === 0 ? (
				<View style={styles.empty}>
					<Text style={styles.emptyText}>
						No recipes yet. Tap + New to add one.
					</Text>
				</View>
			) : (
				<FlatList
					data={recipes}
					keyExtractor={(r) => r.id}
					contentContainerStyle={styles.list}
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

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#0f0f1a" },
	headerBar: {
		padding: 16,
		alignItems: "flex-end",
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	newBtn: {
		backgroundColor: "#7c9fff",
		borderRadius: 6,
		paddingVertical: 9,
		paddingHorizontal: 18,
	},
	newBtnText: { color: "#000", fontWeight: "bold", fontSize: 15 },
	empty: { flex: 1, alignItems: "center", justifyContent: "center" },
	emptyText: { color: "#555", fontSize: 16 },
	list: { padding: 16 },
});
