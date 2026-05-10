import { Text, TextInput, View } from "react-native";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import type { DoughMethod } from "@/types/recipe";

type Props = {
	name: string;
	ballWeight: string;
	doughMethod: DoughMethod;
	prefermentFlourPct: string;
	prefermentHydration: string;
	bigaYeastPercentOnBigaFlour: string;
	autolyseWaterPct: string;
	onNameChange: (v: string) => void;
	onBallWeightChange: (v: string) => void;
	onDoughMethodChange: (v: DoughMethod) => void;
	onPrefermentFlourPctChange: (v: string) => void;
	onPrefermentHydrationChange: (v: string) => void;
	onBigaYeastPctChange: (v: string) => void;
	onAutolyseWaterPctChange: (v: string) => void;
};

const METHOD_OPTIONS: { value: DoughMethod; label: string; testID: string }[] =
	[
		{ value: "direct", label: "Direct", testID: "method_direct" },
		{ value: "biga", label: "Biga", testID: "method_biga" },
		{ value: "autolyse", label: "Autolyse", testID: "method_autolyse" },
	];

export const RecipeBasicFields = ({
	name,
	ballWeight,
	doughMethod,
	prefermentFlourPct,
	prefermentHydration,
	bigaYeastPercentOnBigaFlour,
	autolyseWaterPct,
	onNameChange,
	onBallWeightChange,
	onDoughMethodChange,
	onPrefermentFlourPctChange,
	onPrefermentHydrationChange,
	onBigaYeastPctChange,
	onAutolyseWaterPctChange,
}: Props) => {
	return (
		<View>
			<View className="flex-row gap-3.5 mb-5">
				<View className="flex-[2]">
					<FieldLabel>Recipe name</FieldLabel>
					<TextInput
						className="bg-bg-surface rounded-lg border border-border text-content-primary text-sm py-3 px-3.5"
						value={name}
						onChangeText={onNameChange}
						placeholder="e.g. Neapolitan"
						placeholderTextColor="#555"
						testID="recipe_name_input"
						accessibilityLabel="recipe_name_input"
					/>
				</View>
				<View className="flex-1">
					<FieldLabel>Ball weight (g)</FieldLabel>
					<TextInput
						className="bg-bg-surface rounded-lg border border-border text-content-primary text-sm py-3 px-3.5"
						value={ballWeight}
						onChangeText={onBallWeightChange}
						keyboardType="decimal-pad"
						placeholder="280"
						placeholderTextColor="#555"
						testID="ball-weight-input"
					/>
				</View>
			</View>

			<View className="mb-5">
				<FieldLabel>Dough Method</FieldLabel>
				<ToggleGroup
					options={METHOD_OPTIONS}
					value={doughMethod}
					onChange={onDoughMethodChange}
				/>
			</View>

			{doughMethod === "biga" && (
				<View className="bg-bg-surface rounded-lg border border-border p-3.5 mb-5">
					<Text className="text-accent-blue text-xxs uppercase tracking-label mb-3">
						Biga Parameters
					</Text>
					<View className="flex-row gap-2.5 mb-2.5">
						<View className="flex-1 mb-2.5">
							<FieldLabel>Flour %</FieldLabel>
							<TextInput
								className="bg-bg-surface rounded-lg border border-border text-content-primary text-sm py-3 px-3.5"
								value={prefermentFlourPct}
								onChangeText={onPrefermentFlourPctChange}
								keyboardType="decimal-pad"
								placeholder="40"
								placeholderTextColor="#555"
								testID="preferment-flour-pct"
							/>
						</View>
						<View className="flex-1 mb-2.5">
							<FieldLabel>Hydration %</FieldLabel>
							<TextInput
								className="bg-bg-surface rounded-lg border border-border text-content-primary text-sm py-3 px-3.5"
								value={prefermentHydration}
								onChangeText={onPrefermentHydrationChange}
								keyboardType="decimal-pad"
								placeholder="45"
								placeholderTextColor="#555"
								testID="preferment-hydration"
							/>
						</View>
					</View>
					<View className="flex-1 mb-2.5">
						<FieldLabel>Biga Yeast % on Biga Flour</FieldLabel>
						<TextInput
							className="bg-bg-surface rounded-lg border border-border text-content-primary text-sm py-3 px-3.5"
							value={bigaYeastPercentOnBigaFlour}
							onChangeText={onBigaYeastPctChange}
							keyboardType="decimal-pad"
							placeholder="0.2"
							placeholderTextColor="#555"
							testID="biga-yeast-pct"
						/>
						<Text className="text-content-faint text-xxs mt-1">
							e.g. 0.2 means 0.2% of biga flour weight
						</Text>
					</View>
				</View>
			)}

			{doughMethod === "autolyse" && (
				<View className="bg-bg-surface rounded-lg border border-border p-3.5 mb-5">
					<Text className="text-accent-blue text-xxs uppercase tracking-label mb-3">
						Autolyse Parameters
					</Text>
					<View className="flex-1 mb-2.5">
						<FieldLabel>Autolyse Water %</FieldLabel>
						<TextInput
							className="bg-bg-surface rounded-lg border border-border text-content-primary text-sm py-3 px-3.5"
							value={autolyseWaterPct}
							onChangeText={onAutolyseWaterPctChange}
							keyboardType="decimal-pad"
							placeholder="100"
							placeholderTextColor="#555"
							testID="autolyse-water-pct"
						/>
						<Text className="text-content-faint text-xxs mt-1">
							% of total water used in the autolyse step (default 100%)
						</Text>
					</View>
				</View>
			)}
		</View>
	);
};
