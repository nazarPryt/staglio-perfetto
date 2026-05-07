import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { Recipe } from "@/types/recipe";

type Props = {
	recipe: Recipe;
	onEdit: () => void;
	onDelete: () => void;
};

export const RecipeCard = ({ recipe, onEdit, onDelete }: Props) => {
	function handleDelete() {
		Alert.alert(
			"Delete Recipe",
			`Delete "${recipe.name}"? This cannot be undone.`,
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Delete", style: "destructive", onPress: onDelete },
			],
		);
	}

	return (
		<Card className="p-4 flex-row justify-between items-start mb-3">
			<View className="flex-1 mr-2">
				<Text className="text-content-primary font-bold text-md">
					{recipe.name}
				</Text>
				<Text className="text-content-muted text-label mt-0.75">
					Ball weight: {recipe.ballWeight}g
				</Text>
				{recipe.ingredients.map((i) => (
					<Text key={i.id} className="text-content-muted text-label mt-0.75">
						{i.name}: {(i.grams / 10).toFixed(1)}%
					</Text>
				))}
			</View>
			<View className="flex-row gap-4">
				<TouchableOpacity onPress={onEdit}>
					<Text className="text-accent-blue text-sm">Edit</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={handleDelete}>
					<Text className="text-accent-red text-sm">Delete</Text>
				</TouchableOpacity>
			</View>
		</Card>
	);
};
