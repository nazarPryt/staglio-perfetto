import { useReducer, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { calcResult, calcResultHeader } from "@/bll/calculatorUtils";
import { FieldLabel } from "@/components/ui/FieldLabel";
import type { Recipe } from "@/types/recipe";
import {
	ModeToggle,
	RecipePicker,
	ResultModal,
	ResultTable,
	TwoStepResult,
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
		result && result.kind !== "error" && recipe
			? calcResultHeader(result, mode, recipe, inputValue)
			: "";

	if (recipes.length === 0) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text className="text-content-faint text-base">
					Add a recipe in the Recipes tab first.
				</Text>
			</View>
		);
	}

	const methodLabel = recipe?.doughMethod
		? recipe.doughMethod.toUpperCase()
		: "DIRECT";

	return (
		<View className="flex-1">
			<RecipePicker
				recipes={recipes}
				selectedId={selectedId}
				onSelect={(id) => dispatch({ type: "SELECT_RECIPE", id })}
			/>

			<ModeToggle
				mode={mode}
				onChange={(m) => dispatch({ type: "SET_MODE", mode: m })}
			/>

			<View className="mb-5">
				<FieldLabel>
					{mode === "by-count"
						? "Number of dough balls"
						: "Flour available (kg)"}
				</FieldLabel>
				<TextInput
					testID="calculator_input"
					accessibilityLabel="calculator_input"
					className="bg-bg-surface rounded-lg border border-accent-blue text-content-primary text-lg font-bold py-3.5 px-4"
					value={inputValue}
					onChangeText={(value) => dispatch({ type: "SET_INPUT", value })}
					keyboardType="decimal-pad"
					placeholder={mode === "by-count" ? "e.g. 8" : "e.g. 2.5"}
					placeholderTextColor="#555"
				/>
			</View>

			{result?.kind === "error" && (
				<View className="bg-bg-error rounded-lg border border-accent-red p-3.5 mb-3">
					<Text className="text-accent-red text-sm">{result.message}</Text>
				</View>
			)}

			{result && result.kind === "single" && (
				<>
					<View className="self-start bg-bg-surface rounded-badge border border-accent-blue px-2.5 py-0.75 mb-3">
						<Text className="text-accent-blue text-xxs tracking-label">
							{methodLabel}
						</Text>
					</View>
					<ResultTable result={result} mode={mode} header={header} />
					<Pressable
						className="mt-4 bg-accent-green rounded-lg py-3.5 items-center"
						onPress={() => setModalVisible(true)}
					>
						<Text className="text-bg-modal text-md font-bold uppercase tracking-label">
							Preview
						</Text>
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

			{result && result.kind === "two-step" && (
				<>
					<View className="self-start bg-bg-surface rounded-badge border border-accent-blue px-2.5 py-0.75 mb-3">
						<Text className="text-accent-blue text-xxs tracking-label">
							{methodLabel}
						</Text>
					</View>
					<TwoStepResult result={result} header={header} />
					<Pressable
						className="mt-4 bg-accent-green rounded-lg py-3.5 items-center"
						onPress={() => setModalVisible(true)}
					>
						<Text className="text-bg-modal text-md font-bold uppercase tracking-label">
							Preview
						</Text>
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
