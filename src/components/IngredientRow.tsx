import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import type { IngredientType } from "@/types/recipe";

const TYPE_OPTIONS: IngredientType[] = ["water", "yeast", "salt", "other"];

type Props = {
	name: string;
	grams: string;
	type?: IngredientType;
	ingredientId?: string;
	onNameChange?: (value: string) => void;
	onGramsChange: (value: string) => void;
	onPercentageChange: (value: string) => void;
	onTypeChange?: (type: IngredientType) => void;
	onDelete?: () => void;
	locked?: boolean;
};

export const IngredientRow = ({
	name,
	grams,
	type,
	ingredientId,
	onNameChange,
	onGramsChange,
	onPercentageChange,
	onTypeChange,
	onDelete,
	locked = false,
}: Props) => {
	const gramsNum = parseFloat(grams) || 0;
	const derivedPct = (gramsNum / 10).toFixed(1);
	const [pctDisplay, setPctDisplay] = useState(derivedPct);

	useEffect(() => {
		setPctDisplay(derivedPct);
	}, [derivedPct]);

	return (
		<View className="mb-2">
			<View className="flex-row items-center gap-2">
				{locked || !onNameChange ? (
					<Text className="text-content-disabled text-sm py-2.5 px-3 bg-bg-surface rounded-md border border-border-locked flex-[2]">
						{name}
					</Text>
				) : (
					<TextInput
						className="bg-bg-surface rounded-lg border border-border text-content-primary text-sm py-3 px-3.5 flex-[2]"
						value={name}
						onChangeText={onNameChange}
						placeholder="Ingredient"
						placeholderTextColor="#555"
					/>
				)}
				<TextInput
					className="bg-bg-surface rounded-lg border border-border text-content-primary text-sm py-3 px-3.5 flex-1 text-right"
					value={grams}
					onChangeText={onGramsChange}
					keyboardType="decimal-pad"
					placeholder="0"
					placeholderTextColor="#555"
					testID={ingredientId ? `grams-${ingredientId}` : undefined}
				/>
				<TextInput
					className="bg-bg-surface rounded-lg border border-border text-content-primary text-sm py-3 px-3.5 flex-1 text-right"
					value={pctDisplay}
					onChangeText={setPctDisplay}
					onBlur={() => onPercentageChange(pctDisplay)}
					keyboardType="decimal-pad"
					placeholder="0"
					placeholderTextColor="#555"
				/>
				<View className="w-7 items-center">
					{onDelete ? (
						<TouchableOpacity onPress={onDelete}>
							<Text className="text-accent-red text-lg">✕</Text>
						</TouchableOpacity>
					) : (
						<Text className="text-sm">🔒</Text>
					)}
				</View>
			</View>

			{!locked && onTypeChange && (
				<View className="flex-row gap-1.5 mt-1 pl-1">
					{TYPE_OPTIONS.map((t) => (
						<TouchableOpacity
							key={t}
							className={`px-2.5 py-1 rounded-chip border ${
								type === t
									? "border-accent-blue bg-bg-active"
									: "border-border bg-bg-surface"
							}`}
							onPress={() => onTypeChange(t)}
						>
							<Text
								className={`text-xxs ${type === t ? "text-accent-blue font-bold" : "text-content-faint"}`}
							>
								{t}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	);
};
