import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { FieldLabel } from "@/components/ui/FieldLabel";
import type { Recipe } from "@/types/recipe";

type Props = {
	recipes: Recipe[];
	selectedId: string;
	onSelect: (id: string) => void;
};

export const RecipePicker = ({ recipes, selectedId, onSelect }: Props) => {
	const [open, setOpen] = useState(false);
	const selected = recipes.find((r) => r.id === selectedId);
	const totalDoughPerKg = selected
		? (1000 + selected.ingredients.reduce((s, i) => s + i.grams, 0)).toFixed(0)
		: null;

	return (
		<View className="mb-5">
			<FieldLabel>Recipe</FieldLabel>
			<TouchableOpacity
				testID="recipe_picker"
				accessibilityLabel="recipe_picker"
				className="bg-bg-surface rounded-lg border border-border p-3.5 flex-row justify-between"
				onPress={() => setOpen((v) => !v)}
			>
				<Text className="text-content-primary text-sm">
					{selected?.name ?? "Select…"}
				</Text>
				<Text className="text-content-muted">▾</Text>
			</TouchableOpacity>
			{open && (
				<Card className="mt-1">
					{recipes.map((r) => (
						<TouchableOpacity
							key={r.id}
							testID={`recipe_option_${r.name.replace(/\s+/g, "_")}`}
							accessibilityLabel={`recipe_option_${r.name.replace(/\s+/g, "_")}`}
							className="p-3.5 border-b border-border"
							onPress={() => {
								onSelect(r.id);
								setOpen(false);
							}}
						>
							<Text className="text-content-primary text-sm">{r.name}</Text>
						</TouchableOpacity>
					))}
				</Card>
			)}
			{selected && totalDoughPerKg && (
				<Text className="text-content-faint text-label mt-1.5">
					Ball weight: {selected.ballWeight}g · Dough per 1kg flour:{" "}
					{totalDoughPerKg}g
				</Text>
			)}
		</View>
	);
};
