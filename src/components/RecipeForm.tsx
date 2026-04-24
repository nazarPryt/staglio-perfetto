import { useState } from "react";
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { generateId } from "@/lib/generateId";
import type { Ingredient, Recipe } from "@/types/recipe";
import { IngredientsTable, RecipeBasicFields } from "./recipe-form";

type Props = {
	visible: boolean;
	initial?: Recipe;
	onSave: (recipe: Recipe) => void;
	onClose: () => void;
};

const DEFAULT_INGREDIENTS: Ingredient[] = [
	{ id: "water", name: "Water", grams: 650 },
	{ id: "salt", name: "Salt", grams: 25 },
	{ id: "yeast", name: "Yeast", grams: 3 },
];

const REQUIRED_IDS = new Set(["water", "salt", "yeast"]);

export const RecipeForm = ({ visible, initial, onSave, onClose }: Props) => {
	const [name, setName] = useState(initial?.name ?? "");
	const [ballWeight, setBallWeight] = useState(
		initial?.ballWeight?.toString() ?? "280",
	);
	const [ingredients, setIngredients] = useState<Ingredient[]>(
		initial?.ingredients ?? DEFAULT_INGREDIENTS,
	);

	function updateGrams(id: string, raw: string) {
		setIngredients((prev) =>
			prev.map((i) =>
				i.id === id ? { ...i, grams: parseFloat(raw) || 0 } : i,
			),
		);
	}

	function updatePercentage(id: string, raw: string) {
		const pct = parseFloat(raw) || 0;
		setIngredients((prev) =>
			prev.map((i) => (i.id === id ? { ...i, grams: pct * 10 } : i)),
		);
	}

	function updateName(id: string, value: string) {
		setIngredients((prev) =>
			prev.map((i) => (i.id === id ? { ...i, name: value } : i)),
		);
	}

	function addIngredient() {
		setIngredients((prev) => [
			...prev,
			{ id: generateId(), name: "", grams: 0 },
		]);
	}

	function removeIngredient(id: string, ingredientName: string) {
		Alert.alert(
			"Remove ingredient",
			`Remove "${ingredientName || "this ingredient"}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: () =>
						setIngredients((prev) => prev.filter((i) => i.id !== id)),
				},
			],
		);
	}

	function handleSave() {
		if (!name.trim()) {
			Alert.alert("Validation", "Recipe name is required.");
			return;
		}
		const weight = parseFloat(ballWeight);
		if (!weight || weight <= 0) {
			Alert.alert("Validation", "Ball weight must be a positive number.");
			return;
		}
		const invalid = ingredients.find(
			(i) => (!REQUIRED_IDS.has(i.id) && !i.name.trim()) || i.grams <= 0,
		);
		if (invalid) {
			Alert.alert(
				"Validation",
				"All ingredients must have a name and grams greater than 0.",
			);
			return;
		}
		onSave({
			id: initial?.id ?? generateId(),
			name: name.trim(),
			ballWeight: weight,
			ingredients,
			createdAt: initial?.createdAt ?? Date.now(),
		});
	}

	const totalDough = 1000 + ingredients.reduce((sum, i) => sum + i.grams, 0);

	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose}>
			<ScrollView
				style={styles.container}
				contentContainerStyle={styles.content}
			>
				<View style={styles.header}>
					<Text style={styles.title}>
						{initial ? "Edit Recipe" : "New Recipe"}
					</Text>
					<TouchableOpacity onPress={onClose}>
						<Text style={styles.closeBtn}>✕</Text>
					</TouchableOpacity>
				</View>

				<RecipeBasicFields
					name={name}
					ballWeight={ballWeight}
					onNameChange={setName}
					onBallWeightChange={setBallWeight}
				/>

				<IngredientsTable
					ingredients={ingredients}
					totalDough={totalDough}
					onUpdateGrams={updateGrams}
					onUpdatePercentage={updatePercentage}
					onUpdateName={updateName}
					onAdd={addIngredient}
					onRemove={removeIngredient}
				/>

				<TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
					<Text style={styles.saveBtnText}>Save Recipe</Text>
				</TouchableOpacity>
			</ScrollView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#0f0f1a" },
	content: { padding: 20, paddingBottom: 48 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 24,
	},
	title: { color: "#e0e0e0", fontSize: 22, fontWeight: "bold" },
	closeBtn: { color: "#888", fontSize: 24, padding: 4 },
	saveBtn: {
		backgroundColor: "#7c9fff",
		borderRadius: 8,
		padding: 18,
		alignItems: "center",
	},
	saveBtnText: { color: "#000", fontWeight: "bold", fontSize: 17 },
});
