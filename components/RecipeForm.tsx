import { useState } from "react";
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import IngredientRow from "@/components/IngredientRow";
import type { Ingredient, Recipe } from "@/types/recipe";
import { generateId } from "@/lib/generateId";
const uuidv4 = generateId;
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

export default function RecipeForm({
	visible,
	initial,
	onSave,
	onClose,
}: Props) {
	const [name, setName] = useState(initial?.name ?? "");
	const [ballWeight, setBallWeight] = useState(
		initial?.ballWeight?.toString() ?? "280",
	);
	const [ingredients, setIngredients] = useState<Ingredient[]>(
		initial?.ingredients ?? DEFAULT_INGREDIENTS,
	);

	function updateGrams(id: string, rawGrams: string) {
		setIngredients((prev) =>
			prev.map((i) =>
				i.id === id ? { ...i, grams: parseFloat(rawGrams) || 0 } : i,
			),
		);
	}

	function updatePercentage(id: string, rawPct: string) {
		const pct = parseFloat(rawPct) || 0;
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
		setIngredients((prev) => [...prev, { id: uuidv4(), name: "", grams: 0 }]);
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

	function totalDough(): number {
		return 1000 + ingredients.reduce((sum, i) => sum + i.grams, 0);
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
		const invalidIngredient = ingredients.find(
			(i) => (!REQUIRED_IDS.has(i.id) && !i.name.trim()) || i.grams <= 0,
		);
		if (invalidIngredient) {
			Alert.alert(
				"Validation",
				"All ingredients must have a name and grams greater than 0.",
			);
			return;
		}
		const recipe: Recipe = {
			id: initial?.id ?? uuidv4(),
			name: name.trim(),
			ballWeight: weight,
			ingredients,
			createdAt: initial?.createdAt ?? Date.now(),
		};
		onSave(recipe);
	}

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

				<View style={styles.row}>
					<View style={{ flex: 2 }}>
						<Text style={styles.label}>Recipe name</Text>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
							placeholder="e.g. Neapolitan"
							placeholderTextColor="#555"
						/>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={styles.label}>Ball weight (g)</Text>
						<TextInput
							style={styles.input}
							value={ballWeight}
							onChangeText={setBallWeight}
							keyboardType="decimal-pad"
							placeholder="280"
							placeholderTextColor="#555"
						/>
					</View>
				</View>

				<Text style={styles.label}>Ingredients for 1 kg of flour</Text>

				<View style={styles.tableHeader}>
					<Text style={[styles.headerCell, { flex: 2 }]}>Ingredient</Text>
					<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>
						Grams
					</Text>
					<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>
						%
					</Text>
					<View style={{ width: 24 }} />
				</View>

				<View style={styles.flourRow}>
					<Text style={[styles.lockedCell, { flex: 2 }]}>Flour</Text>
					<Text style={[styles.lockedCell, { flex: 1, textAlign: "right" }]}>
						1000
					</Text>
					<Text style={[styles.lockedCell, { flex: 1, textAlign: "right" }]}>
						100%
					</Text>
					<View style={{ width: 24 }} />
				</View>

				{ingredients.map((ing) => {
					const isRequired = REQUIRED_IDS.has(ing.id);
					return (
						<IngredientRow
							key={ing.id}
							name={ing.name}
							grams={ing.grams.toString()}
							locked={isRequired}
							onNameChange={
								isRequired ? undefined : (v) => updateName(ing.id, v)
							}
							onGramsChange={(v) => updateGrams(ing.id, v)}
							onPercentageChange={(v) => updatePercentage(ing.id, v)}
							onDelete={
								isRequired
									? undefined
									: () => removeIngredient(ing.id, ing.name)
							}
						/>
					);
				})}

				<TouchableOpacity onPress={addIngredient}>
					<Text style={styles.addBtn}>+ Add ingredient</Text>
				</TouchableOpacity>

				<View style={styles.totalRow}>
					<Text style={styles.totalLabel}>Total dough per 1 kg flour</Text>
					<Text style={styles.totalValue}>{totalDough().toFixed(0)} g</Text>
				</View>

				<TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
					<Text style={styles.saveBtnText}>Save Recipe</Text>
				</TouchableOpacity>
			</ScrollView>
		</Modal>
	);
}

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
	row: { flexDirection: "row", gap: 14, marginBottom: 20 },
	label: {
		color: "#888",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	input: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		color: "#e0e0e0",
		fontSize: 15,
		paddingVertical: 12,
		paddingHorizontal: 14,
	},
	tableHeader: {
		flexDirection: "row",
		paddingHorizontal: 4,
		marginBottom: 6,
		marginTop: 10,
	},
	headerCell: {
		color: "#555",
		fontSize: 12,
		textTransform: "uppercase",
	},
	flourRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
		paddingHorizontal: 4,
	},
	lockedCell: {
		color: "#666",
		fontSize: 15,
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#1a1a2e",
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#222",
	},
	addBtn: { color: "#7c9fff", fontSize: 15, marginTop: 10, marginBottom: 18 },
	totalRow: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 24,
	},
	totalLabel: { color: "#888", fontSize: 15 },
	totalValue: { color: "#7cffb2", fontSize: 16, fontWeight: "bold" },
	saveBtn: {
		backgroundColor: "#7c9fff",
		borderRadius: 8,
		padding: 18,
		alignItems: "center",
	},
	saveBtnText: { color: "#000", fontWeight: "bold", fontSize: 17 },
});
