import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Recipe } from "@/types/recipe";

type Props = {
	recipe: Recipe;
	onEdit: () => void;
	onDelete: () => void;
};

export const RecipeCard = ({ recipe, onEdit, onDelete }: Props) => {
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
				<Text style={styles.summaryLine}>
					Ball weight: {recipe.ballWeight}g
				</Text>
				{recipe.ingredients.map((i) => (
					<Text key={i.id} style={styles.summaryLine}>
						{i.name}: {(i.grams / 10).toFixed(1)}%
					</Text>
				))}
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
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	info: { flex: 1, marginRight: 8 },
	name: { color: "#e0e0e0", fontWeight: "bold", fontSize: 17 },
	summaryLine: { color: "#888", fontSize: 13, marginTop: 3 },
	actions: { flexDirection: "row", gap: 16 },
	editBtn: { color: "#7c9fff", fontSize: 15 },
	deleteBtn: { color: "#ff7c7c", fontSize: 15 },
});
