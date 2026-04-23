// app/(tabs)/calculator.tsx
import { ScrollView, StyleSheet } from "react-native";
import CalculatorForm from "@/components/CalculatorForm";
import { useRecipeStore } from "@/store/recipeStore";

export default function CalculatorScreen() {
	const recipes = useRecipeStore((s) => s.recipes);

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<CalculatorForm recipes={recipes} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#0f0f1a" },
	content: { padding: 16, paddingBottom: 40 },
});
