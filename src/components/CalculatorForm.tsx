import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { calcByCount, calcByFlour } from "@/bll/calculations";
import type {
	CalcByCountResult,
	CalcByFlourResult,
	Recipe,
} from "@/types/recipe";
import { type Mode, ModeToggle, RecipePicker, ResultTable } from "./calculator";

type Result = CalcByCountResult | CalcByFlourResult | null;

type Props = {
	recipes: Recipe[];
};

export const CalculatorForm = ({ recipes }: Props) => {
	const [selectedId, setSelectedId] = useState<string>(recipes[0]?.id ?? "");
	const [mode, setMode] = useState<Mode>("by-count");
	const [inputValue, setInputValue] = useState("");

	const recipe = recipes.find((r) => r.id === selectedId);

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
			<RecipePicker
				recipes={recipes}
				selectedId={selectedId}
				onSelect={(id) => {
					setSelectedId(id);
					setInputValue("");
				}}
			/>

			<ModeToggle
				mode={mode}
				onChange={(m) => {
					setMode(m);
					setInputValue("");
				}}
			/>

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

			{result && (
				<ResultTable result={result} mode={mode} header={resultHeader()} />
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
	empty: { flex: 1, alignItems: "center", justifyContent: "center" },
	emptyText: { color: "#555", fontSize: 16 },
	section: { marginBottom: 20 },
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
		borderColor: "#7c9fff",
		color: "#e0e0e0",
		fontSize: 26,
		fontWeight: "bold",
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
});
