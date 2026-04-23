import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalculatorForm from "@/components/CalculatorForm";
import { useRecipeStore } from "@/store/recipeStore";

export default function CalculatorScreen() {
	const insets = useSafeAreaInsets();
	const recipes = useRecipeStore((s) => s.recipes);

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
		>
			<CalculatorForm recipes={recipes} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#0f0f1a" },
	content: { padding: 16, paddingBottom: 40, paddingTop: 16 },
});
