import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalculatorForm } from "@/components/CalculatorForm";
import { useRecipeStore } from "@/store/recipeStore";

export default function CalculatorScreen() {
	const insets = useSafeAreaInsets();
	const recipes = useRecipeStore((s) => s.recipes);

	return (
		<ScrollView
			className="flex-1 bg-bg-screen"
			contentContainerStyle={{
				padding: 16,
				paddingBottom: 40,
				paddingTop: insets.top + 16,
			}}
		>
			<CalculatorForm recipes={recipes} />
		</ScrollView>
	);
}
