import { useReducer } from "react";
import {
	Alert,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { calcTotalDough, REQUIRED_IDS } from "@/bll/ingredientUtils";
import { generateId } from "@/lib/generateId";
import type { Recipe } from "@/types/recipe";
import { IngredientsTable, RecipeBasicFields } from "./recipe-form";
import { formReducer, initialFormState } from "./recipe-form/formReducer";

type Props = {
	visible: boolean;
	initial?: Recipe;
	onSave: (recipe: Recipe) => void;
	onClose: () => void;
};

export const RecipeForm = ({ visible, initial, onSave, onClose }: Props) => {
	const [state, dispatch] = useReducer(formReducer, initialFormState(initial));
	const {
		name,
		ballWeight,
		ingredients,
		doughMethod,
		prefermentFlourPct,
		prefermentHydration,
		bigaYeastPercentOnBigaFlour,
		autolyseWaterPct,
	} = state;

	function handleRemove(id: string, ingredientName: string) {
		Alert.alert(
			"Remove ingredient",
			`Remove "${ingredientName || "this ingredient"}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Remove",
					style: "destructive",
					onPress: () => dispatch({ type: "REMOVE_INGREDIENT", id }),
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
			doughMethod,
			prefermentFlourPct:
				doughMethod === "biga"
					? parseFloat(prefermentFlourPct) || 40
					: undefined,
			prefermentHydration:
				doughMethod === "biga"
					? parseFloat(prefermentHydration) || 45
					: undefined,
			bigaYeastPercentOnBigaFlour:
				doughMethod === "biga"
					? parseFloat(bigaYeastPercentOnBigaFlour) || 0.2
					: undefined,
			autolyseWaterPct:
				doughMethod === "autolyse"
					? parseFloat(autolyseWaterPct) || 100
					: undefined,
		});
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

				<RecipeBasicFields
					name={name}
					ballWeight={ballWeight}
					doughMethod={doughMethod}
					prefermentFlourPct={prefermentFlourPct}
					prefermentHydration={prefermentHydration}
					bigaYeastPercentOnBigaFlour={bigaYeastPercentOnBigaFlour}
					autolyseWaterPct={autolyseWaterPct}
					onNameChange={(value) => dispatch({ type: "SET_NAME", value })}
					onBallWeightChange={(value) =>
						dispatch({ type: "SET_BALL_WEIGHT", value })
					}
					onDoughMethodChange={(method) =>
						dispatch({ type: "SET_DOUGH_METHOD", method })
					}
					onPrefermentFlourPctChange={(value) =>
						dispatch({ type: "SET_PREFERMENT_FLOUR_PCT", value })
					}
					onPrefermentHydrationChange={(value) =>
						dispatch({ type: "SET_PREFERMENT_HYDRATION", value })
					}
					onBigaYeastPctChange={(value) =>
						dispatch({ type: "SET_BIGA_YEAST_PCT", value })
					}
					onAutolyseWaterPctChange={(value) =>
						dispatch({ type: "SET_AUTOLYSE_WATER_PCT", value })
					}
				/>

				<IngredientsTable
					ingredients={ingredients}
					totalDough={calcTotalDough(ingredients)}
					onUpdateGrams={(id, raw) =>
						dispatch({ type: "UPDATE_GRAMS", id, raw })
					}
					onUpdatePercentage={(id, raw) =>
						dispatch({ type: "UPDATE_PERCENTAGE", id, raw })
					}
					onUpdateName={(id, value) =>
						dispatch({ type: "UPDATE_NAME", id, value })
					}
					onUpdateType={(id, ingredientType) =>
						dispatch({ type: "UPDATE_TYPE", id, ingredientType })
					}
					onAdd={() => dispatch({ type: "ADD_INGREDIENT" })}
					onRemove={handleRemove}
				/>

				<TouchableOpacity style={styles.saveBtn} onPress={handleSave} testID="save_recipe_btn" accessibilityLabel="save_recipe_btn">
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
