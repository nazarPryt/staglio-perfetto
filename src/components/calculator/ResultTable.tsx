import { StyleSheet, Text, View } from "react-native";
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
		<View style={styles.container}>
			<Text style={styles.header}>{header}</Text>

			<View style={styles.tableHeader}>
				<Text style={[styles.headerCell, { flex: 3 }]}>Ingredient</Text>
				<Text style={[styles.headerCell, { flex: 2, textAlign: "right" }]}>
					Grams
				</Text>
				<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>
					%
				</Text>
			</View>

			<View style={styles.row}>
				<Text style={[styles.name, { flex: 3 }]}>Flour</Text>
				<Text style={[styles.grams, { flex: 2, textAlign: "right" }]}>
					{flourGrams}g
				</Text>
				<Text style={[styles.pct, { flex: 1, textAlign: "right" }]}>100%</Text>
			</View>

			{result.ingredients.map((ing) => (
				<View
					key={ing.name}
					style={[
						styles.row,
						ing.source === "preferment" && styles.prefermentRow,
					]}
				>
					<Text
						style={[
							styles.name,
							{ flex: 3 },
							ing.source === "preferment" && styles.prefermentText,
						]}
					>
						{ing.name}
					</Text>
					<Text
						style={[
							styles.grams,
							{ flex: 2, textAlign: "right" },
							ing.source === "preferment" && styles.prefermentText,
						]}
					>
						{Math.round(ing.grams)}g
					</Text>
					<Text style={[styles.pct, { flex: 1, textAlign: "right" }]}>
						{ing.percentage}%
					</Text>
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 24,
	},
	header: {
		color: "#7cffb2",
		fontSize: 17,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 18,
	},
	tableHeader: {
		flexDirection: "row",
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	headerCell: { color: "#555", fontSize: 13, textTransform: "uppercase" },
	row: {
		flexDirection: "row",
		paddingVertical: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	prefermentRow: { backgroundColor: "#0d1f0d" },
	name: { color: "#aaa", fontSize: 20 },
	grams: { color: "#e0e0e0", fontSize: 20, fontWeight: "bold" },
	pct: { color: "#666", fontSize: 18 },
	prefermentText: { color: "#7cffb2" },
});
