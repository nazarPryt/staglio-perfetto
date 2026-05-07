import { Text, TouchableOpacity, View } from "react-native";
import { REQUIRED_IDS } from "@/bll/ingredientUtils";
import { IngredientRow } from "@/components/IngredientRow";
import { Card } from "@/components/ui/Card";
import { FieldLabel } from "@/components/ui/FieldLabel";
import type { Ingredient, IngredientType } from "@/types/recipe";

type Props = {
	ingredients: Ingredient[];
	totalDough: number;
	onUpdateGrams: (id: string, value: string) => void;
	onUpdatePercentage: (id: string, value: string) => void;
	onUpdateName: (id: string, value: string) => void;
	onUpdateType: (id: string, type: IngredientType) => void;
	onAdd: () => void;
	onRemove: (id: string, name: string) => void;
};

export const IngredientsTable = ({
	ingredients,
	totalDough,
	onUpdateGrams,
	onUpdatePercentage,
	onUpdateName,
	onUpdateType,
	onAdd,
	onRemove,
}: Props) => {
	return (
		<>
			<FieldLabel>Ingredients for 1 kg of flour</FieldLabel>

			<View className="flex-row px-1 mb-1.5 mt-2.5">
				<Text className="text-content-faint text-xs uppercase flex-[2]">
					Ingredient
				</Text>
				<Text className="text-content-faint text-xs uppercase flex-1 text-right">
					Grams
				</Text>
				<Text className="text-content-faint text-xs uppercase flex-1 text-right">
					%
				</Text>
				<View className="w-6" />
			</View>

			<View className="flex-row items-center gap-2 mb-2 px-1">
				<Text className="text-content-disabled text-sm py-2.5 px-3 bg-bg-surface rounded-md border border-border-locked flex-[2]">
					Flour
				</Text>
				<Text className="text-content-disabled text-sm py-2.5 px-3 bg-bg-surface rounded-md border border-border-locked flex-1 text-right">
					1000
				</Text>
				<Text className="text-content-disabled text-sm py-2.5 px-3 bg-bg-surface rounded-md border border-border-locked flex-1 text-right">
					100%
				</Text>
				<View className="w-6" />
			</View>

			{ingredients.map((ing) => {
				const isRequired = REQUIRED_IDS.has(ing.id);
				return (
					<IngredientRow
						key={ing.id}
						ingredientId={ing.id}
						name={ing.name}
						grams={ing.grams.toString()}
						type={ing.type}
						locked={isRequired}
						onNameChange={
							isRequired ? undefined : (v) => onUpdateName(ing.id, v)
						}
						onGramsChange={(v) => onUpdateGrams(ing.id, v)}
						onPercentageChange={(v) => onUpdatePercentage(ing.id, v)}
						onTypeChange={
							isRequired ? undefined : (t) => onUpdateType(ing.id, t)
						}
						onDelete={isRequired ? undefined : () => onRemove(ing.id, ing.name)}
					/>
				);
			})}

			<TouchableOpacity onPress={onAdd}>
				<Text className="text-accent-blue text-sm mt-2.5 mb-4.5">
					+ Add ingredient
				</Text>
			</TouchableOpacity>

			<Card className="flex-row justify-between p-4 mb-6">
				<Text className="text-content-muted text-sm">
					Total dough per 1 kg flour
				</Text>
				<Text className="text-accent-green text-base font-bold">
					{totalDough.toFixed(0)} g
				</Text>
			</Card>
		</>
	);
};
