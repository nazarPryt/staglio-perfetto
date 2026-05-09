import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { StepIngredients, TwoStepDoughResult } from "@/types/recipe";

type StepBlockProps = {
	step: StepIngredients;
	title: string;
	testID?: string;
};

const StepBlock = ({ step, title, testID }: StepBlockProps) => (
	<Card className="p-5">
		<Text
			testID={testID}
			accessibilityLabel={testID}
			className="text-accent-green text-xxs font-bold uppercase tracking-label mb-3.5"
		>
			{title}
		</Text>
		<View className="flex-row pb-3 border-b border-border">
			<Text className="text-content-faint text-xs uppercase flex-[3]">
				Ingredient
			</Text>
			<Text className="text-content-faint text-xs uppercase flex-[2] text-right">
				Grams
			</Text>
			<Text className="text-content-faint text-xs uppercase flex-[1] text-right">
				%
			</Text>
		</View>
		{step.flourGrams > 0 && (
			<View className="flex-row py-4 border-b border-border">
				<Text className="text-content-secondary text-lg flex-[3]">Flour</Text>
				<Text
					testID={testID ? `${testID}_flour_grams` : undefined}
					className="text-content-primary text-lg font-bold flex-[2] text-right"
				>
					{Math.round(step.flourGrams)}g
				</Text>
				<Text className="text-content-disabled text-base flex-[1] text-right">
					100%
				</Text>
			</View>
		)}
		{step.ingredients.map((ing) => (
			<View
				key={`${ing.name}-${ing.type ?? "other"}-${ing.source ?? "base"}`}
				className={`flex-row py-4 border-b border-border${ing.source === "preferment" ? " bg-bg-preferment -mx-5 px-5" : ""}`}
			>
				<Text
					className={`text-lg flex-[3] ${ing.source === "preferment" ? "text-accent-green" : "text-content-secondary"}`}
				>
					{ing.source === "preferment" ? `+ ${ing.name}` : ing.name}
				</Text>
				<Text
					testID={
						testID
							? `${testID}_grams_${ing.name.toLowerCase().replace(/\s+/g, "_")}`
							: undefined
					}
					className={`text-lg font-bold flex-[2] text-right ${ing.source === "preferment" ? "text-accent-green" : "text-content-primary"}`}
				>
					{Math.round(ing.grams)}g
				</Text>
				<Text className="text-content-disabled text-base flex-[1] text-right">
					{ing.percentage}%
				</Text>
			</View>
		))}
	</Card>
);

type Props = {
	result: TwoStepDoughResult;
	header: string;
};

export const TwoStepResult = ({ result, header }: Props) => (
	<View>
		<Text className="text-accent-green text-md font-bold uppercase tracking-label mb-4.5">
			{header}
		</Text>
		<StepBlock
			step={result.step1}
			title={`Step 1 — ${result.step1Label}`}
			testID="step1_label"
		/>
		<View className="h-3" />
		<StepBlock
			step={result.step2}
			title="Step 2 — Final Dough"
			testID="step2_label"
		/>
		<Card className="flex-row mt-3 p-3.5 gap-4">
			<View className="flex-1">
				<Text
					testID="totals_label_flour"
					accessibilityLabel="totals_label_flour"
					className="text-content-faint text-xxs uppercase"
				>
					Total flour
				</Text>
				<Text
					testID="result_total_flour"
					className="text-content-muted text-sm mt-1"
				>
					{Math.round(result.totalFlourGrams)}g
				</Text>
			</View>
			<View className="flex-1">
				<Text className="text-content-faint text-xxs uppercase">
					Total dough
				</Text>
				<Text
					testID="result_total_dough"
					className="text-content-muted text-sm mt-1"
				>
					{Math.round(result.totalDoughGrams)}g
				</Text>
			</View>
		</Card>
	</View>
);
