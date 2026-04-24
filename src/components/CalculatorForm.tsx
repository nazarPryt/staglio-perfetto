import { useReducer, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { calcResult, calcResultHeader } from "@/bll/calculatorUtils";
import type { Recipe } from "@/types/recipe";
import {
	ModeToggle,
	RecipePicker,
	ResultModal,
	ResultTable,
} from "./calculator";
import {
	calculatorReducer,
	initialCalculatorState,
} from "./calculator/calculatorReducer";

type Props = {
	recipes: Recipe[];
};

export const CalculatorForm = ({ recipes }: Props) => {
	const [state, dispatch] = useReducer(
		calculatorReducer,
		initialCalculatorState(recipes),
	);
	const [modalVisible, setModalVisible] = useState(false);
	const { selectedId, mode, inputValue } = state;

	const recipe = recipes.find((r) => r.id === selectedId);
	const result = recipe ? calcResult(recipe, mode, inputValue) : null;
	const header =
		result && recipe ? calcResultHeader(result, mode, recipe, inputValue) : "";

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
				onSelect={(id) => dispatch({ type: "SELECT_RECIPE", id })}
			/>

			<ModeToggle
				mode={mode}
				onChange={(mode) => dispatch({ type: "SET_MODE", mode })}
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
					onChangeText={(value) => dispatch({ type: "SET_INPUT", value })}
					keyboardType="decimal-pad"
					placeholder={mode === "by-count" ? "e.g. 8" : "e.g. 2.5"}
					placeholderTextColor="#555"
				/>
			</View>

			{result && recipe && (
				<>
					<ResultTable result={result} mode={mode} header={header} />
					<Pressable
						style={styles.previewButton}
						onPress={() => setModalVisible(true)}
					>
						<Text style={styles.previewButtonText}>Preview</Text>
					</Pressable>
					<ResultModal
						visible={modalVisible}
						result={result}
						mode={mode}
						header={header}
						onClose={() => setModalVisible(false)}
					/>
				</>
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
	previewButton: {
		marginTop: 16,
		backgroundColor: "#7cffb2",
		borderRadius: 8,
		paddingVertical: 14,
		alignItems: "center",
	},
	previewButtonText: {
		color: "#0d0d1a",
		fontSize: 17,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});
