import { Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { IngredientResult, Mode } from "@/types/recipe";

type ResultLike = {
	flourGrams: number;
	ingredients: IngredientResult[];
};

type Props = {
	result: ResultLike;
	mode: Mode;
	header: string;
};

export const ResultTable = ({ result, header }: Props) => {
	const flourGrams = Math.round(result.flourGrams);

	return (
		<Card className="p-6">
			<Text className="text-accent-green text-md font-bold uppercase tracking-label mb-4.5">
				{header}
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

			<View className="flex-row py-4 border-b border-border">
				<Text className="text-content-secondary text-xl flex-[3]">Flour</Text>
				<Text
					testID="result_flour_grams"
					className="text-content-primary text-xl font-bold flex-[2] text-right"
				>
					{flourGrams}g
				</Text>
				<Text className="text-content-disabled text-lg flex-[1] text-right">
					100%
				</Text>
			</View>

			{result.ingredients.map((ing) => (
				<View
					key={ing.name}
					className={`flex-row py-4 border-b border-border${ing.source === "preferment" ? " bg-bg-preferment" : ""}`}
				>
					<Text
						className={`text-xl flex-[3] ${ing.source === "preferment" ? "text-accent-green" : "text-content-secondary"}`}
					>
						{ing.name}
					</Text>
					<Text
						testID={`result_grams_${ing.name.toLowerCase().replace(/\s+/g, "_")}`}
						className={`text-xl font-bold flex-[2] text-right ${ing.source === "preferment" ? "text-accent-green" : "text-content-primary"}`}
					>
						{Math.round(ing.grams)}g
					</Text>
					<Text className="text-content-disabled text-lg flex-[1] text-right">
						{ing.percentage}%
					</Text>
				</View>
			))}
		</Card>
	);
};
