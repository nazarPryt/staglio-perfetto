// components/CalculatorForm.tsx
import { useState } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { calcByCount, calcByFlour } from "@/bll/calculations";
import type {
	CalcByCountResult,
	CalcByFlourResult,
	Recipe,
} from "@/types/recipe";

type Result = CalcByCountResult | CalcByFlourResult | null;

type Mode = "by-count" | "by-flour";

type Props = {
	recipes: Recipe[];
};

export default function CalculatorForm({ recipes }: Props) {
	const [selectedId, setSelectedId] = useState<string>(recipes[0]?.id ?? "");
	const [mode, setMode] = useState<Mode>("by-count");
	const [inputValue, setInputValue] = useState("");
	const [pickerOpen, setPickerOpen] = useState(false);

	const recipe = recipes.find((r) => r.id === selectedId);

	const totalDoughPerKg = recipe
		? (1000 + recipe.ingredients.reduce((s, i) => s + i.grams, 0)).toFixed(0)
		: "—";

	let result: Result = null;

	if (recipe) {
		const val = parseFloat(inputValue);
		if (val > 0) {
			result =
				mode === "by-count"
					? calcByCount(recipe, val)
					: calcByFlour(recipe, val);
		}
	}

	function resultHeader(): string {
		if (!result || !recipe) return "";
		if (mode === "by-count") {
			const r = result as CalcByCountResult;
			return `${inputValue} balls × ${recipe.ballWeight}g = ${r.totalDoughGrams}g total dough`;
		}
		const r = result as CalcByFlourResult;
		return `${r.ballCount} balls · ${r.totalDoughGrams}g total dough`;
	}

	if (recipes.length === 0) {
		return (
			<View style={styles.empty}>
				<Text style={styles.emptyText}>
					Add a recipe in the Recipes tab first.
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Recipe picker */}
			<View style={styles.section}>
				<Text style={styles.label}>Recipe</Text>
				<TouchableOpacity
					style={styles.picker}
					onPress={() => setPickerOpen((v) => !v)}
				>
					<Text style={styles.pickerText}>{recipe?.name ?? "Select…"}</Text>
					<Text style={styles.pickerChevron}>▾</Text>
				</TouchableOpacity>
				{pickerOpen && (
					<View style={styles.pickerDropdown}>
						{recipes.map((r) => (
							<TouchableOpacity
								key={r.id}
								style={styles.pickerOption}
								onPress={() => {
									setSelectedId(r.id);
									setPickerOpen(false);
									setInputValue("");
								}}
							>
								<Text style={styles.pickerOptionText}>{r.name}</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
				{recipe && (
					<Text style={styles.hint}>
						Ball weight: {recipe.ballWeight}g · Dough per 1kg flour:{" "}
						{totalDoughPerKg}g
					</Text>
				)}
			</View>

			{/* Mode toggle */}
			<View style={styles.section}>
				<Text style={styles.label}>Mode</Text>
				<View style={styles.toggle}>
					<TouchableOpacity
						style={[
							styles.toggleOption,
							mode === "by-count" && styles.toggleActive,
						]}
						onPress={() => {
							setMode("by-count");
							setInputValue("");
						}}
					>
						<Text
							style={[
								styles.toggleText,
								mode === "by-count" && styles.toggleTextActive,
							]}
						>
							How many balls?
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.toggleOption,
							mode === "by-flour" && styles.toggleActive,
						]}
						onPress={() => {
							setMode("by-flour");
							setInputValue("");
						}}
					>
						<Text
							style={[
								styles.toggleText,
								mode === "by-flour" && styles.toggleTextActive,
							]}
						>
							Flour available
						</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Input */}
			<View style={styles.section}>
				<Text style={styles.label}>
					{mode === "by-count"
						? "Number of dough balls"
						: "Flour available (kg)"}
				</Text>
				<TextInput
					style={styles.input}
					value={inputValue}
					onChangeText={setInputValue}
					keyboardType="decimal-pad"
					placeholder={mode === "by-count" ? "e.g. 8" : "e.g. 2.5"}
					placeholderTextColor="#555"
				/>
			</View>

			{/* Result */}
			{result && (
				<View style={styles.result}>
					<Text style={styles.resultHeader}>{resultHeader()}</Text>

					<View style={styles.resultTableHeader}>
						<Text style={[styles.resultHeaderCell, { flex: 2 }]}>
							Ingredient
						</Text>
						<Text
							style={[styles.resultHeaderCell, { flex: 1, textAlign: "right" }]}
						>
							Grams
						</Text>
						<Text
							style={[styles.resultHeaderCell, { flex: 1, textAlign: "right" }]}
						>
							%
						</Text>
					</View>

					{/* Flour row */}
					<View style={styles.resultRow}>
						<Text style={[styles.resultName, { flex: 2 }]}>Flour</Text>
						<Text style={[styles.resultGrams, { flex: 1, textAlign: "right" }]}>
							{mode === "by-count"
								? `${(result as CalcByCountResult).flourGrams}g`
								: `${(result as CalcByFlourResult).flourGrams}g`}
						</Text>
						<Text style={[styles.resultPct, { flex: 1, textAlign: "right" }]}>
							100%
						</Text>
					</View>

					{result.ingredients.map((ing) => (
						<View key={ing.name} style={styles.resultRow}>
							<Text style={[styles.resultName, { flex: 2 }]}>{ing.name}</Text>
							<Text
								style={[styles.resultGrams, { flex: 1, textAlign: "right" }]}
							>
								{ing.grams}g
							</Text>
							<Text style={[styles.resultPct, { flex: 1, textAlign: "right" }]}>
								{ing.percentage}%
							</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	empty: { flex: 1, alignItems: "center", justifyContent: "center" },
	emptyText: { color: "#555", fontSize: 14 },
	section: { marginBottom: 16 },
	label: {
		color: "#888",
		fontSize: 11,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 4,
	},
	hint: { color: "#555", fontSize: 11, marginTop: 4 },
	picker: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 10,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	pickerText: { color: "#e0e0e0", fontSize: 13 },
	pickerChevron: { color: "#888" },
	pickerDropdown: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		marginTop: 4,
	},
	pickerOption: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	pickerOptionText: { color: "#e0e0e0", fontSize: 13 },
	toggle: {
		flexDirection: "row",
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 3,
	},
	toggleOption: { flex: 1, borderRadius: 6, padding: 8, alignItems: "center" },
	toggleActive: { backgroundColor: "#7c9fff" },
	toggleText: { color: "#666", fontSize: 12 },
	toggleTextActive: { color: "#000", fontWeight: "bold" },
	input: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#7c9fff",
		color: "#e0e0e0",
		fontSize: 22,
		fontWeight: "bold",
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	result: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 12,
	},
	resultHeader: {
		color: "#7cffb2",
		fontSize: 11,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 10,
	},
	resultTableHeader: { flexDirection: "row", marginBottom: 6 },
	resultHeaderCell: { color: "#555", fontSize: 10, textTransform: "uppercase" },
	resultRow: { flexDirection: "row", marginBottom: 5 },
	resultName: { color: "#aaa", fontSize: 13 },
	resultGrams: { color: "#e0e0e0", fontSize: 13, fontWeight: "bold" },
	resultPct: { color: "#666", fontSize: 12 },
});
