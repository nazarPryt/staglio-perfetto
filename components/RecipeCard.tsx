// components/RecipeCard.tsx
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Recipe } from "@/types/recipe";

type Props = {
	recipe: Recipe;
	onEdit: () => void;
	onDelete: () => void;
};

function ingredientSummary(recipe: Recipe): string {
	return recipe.ingredients
		.map((i) => `${i.name} ${(i.grams / 10).toFixed(1)}%`)
		.join(" · ");
}

export default function RecipeCard({ recipe, onEdit, onDelete }: Props) {
	function handleDelete() {
		Alert.alert(
			"Delete Recipe",
			`Delete "${recipe.name}"? This cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Delete", style: "destructive", onPress: onDelete },
			],
		);
	}

	return (
		<View style={styles.card}>
			<View style={styles.info}>
				<Text style={styles.name}>{recipe.name}</Text>
				<Text style={styles.summary}>
					Ball: {recipe.ballWeight}g · {ingredientSummary(recipe)}
				</Text>
			</View>
			<View style={styles.actions}>
				<TouchableOpacity onPress={onEdit}>
					<Text style={styles.editBtn}>Edit</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={handleDelete}>
					<Text style={styles.deleteBtn}>Delete</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	info: { flex: 1, marginRight: 8 },
	name: { color: "#e0e0e0", fontWeight: "bold", fontSize: 14 },
	summary: { color: "#888", fontSize: 11, marginTop: 2 },
	actions: { flexDirection: "row", gap: 12 },
	editBtn: { color: "#7c9fff", fontSize: 13 },
	deleteBtn: { color: "#ff7c7c", fontSize: 13 },
});
