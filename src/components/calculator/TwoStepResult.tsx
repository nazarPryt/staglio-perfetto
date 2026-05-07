import { StyleSheet, Text, View } from "react-native";
import type { StepIngredients, TwoStepDoughResult } from "@/types/recipe";

type StepBlockProps = {
	step: StepIngredients;
	title: string;
	testID?: string;
};

const StepBlock = ({ step, title, testID }: StepBlockProps) => (
	<View style={styles.block}>
		<Text testID={testID} accessibilityLabel={testID} style={styles.stepLabel}>{title}</Text>
		<View style={styles.tableHeader}>
			<Text style={[styles.headerCell, { flex: 3 }]}>Ingredient</Text>
			<Text style={[styles.headerCell, { flex: 2, textAlign: "right" }]}>
				Grams
			</Text>
			<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>
				%
			</Text>
		</View>
		{step.flourGrams > 0 && (
			<View style={styles.row}>
				<Text style={[styles.name, { flex: 3 }]}>Flour</Text>
				<Text style={[styles.grams, { flex: 2, textAlign: "right" }]}>
					{Math.round(step.flourGrams)}g
				</Text>
				<Text style={[styles.pct, { flex: 1, textAlign: "right" }]}>100%</Text>
			</View>
		)}
		{step.ingredients.map((ing) => (
			<View
				key={`${ing.name}-${ing.type ?? "other"}-${ing.source ?? "base"}`}
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
					{ing.source === "preferment" ? `+ ${ing.name}` : ing.name}
				</Text>
				<Text
					testID={testID ? `${testID}_grams_${ing.name.toLowerCase().replace(/\s+/g, "_")}` : undefined}
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

type Props = {
	result: TwoStepDoughResult;
	header: string;
};

export const TwoStepResult = ({ result, header }: Props) => (
	<View>
		<Text style={styles.header}>{header}</Text>
		<StepBlock step={result.step1} title={`Step 1 — ${result.step1Label}`} testID="step1_label" />
		<View style={styles.gap} />
		<StepBlock step={result.step2} title="Step 2 — Final Dough" testID="step2_label" />
		<View style={styles.totalsRow}>
			<View style={styles.totalsItem}>
				<Text testID="totals_label_flour" accessibilityLabel="totals_label_flour" style={styles.totalsLabel}>Total flour</Text>
				<Text testID="result_total_flour" style={styles.totalsValue}>
					{Math.round(result.totalFlourGrams)}g
				</Text>
			</View>
			<View style={styles.totalsItem}>
				<Text style={styles.totalsLabel}>Total dough</Text>
				<Text testID="result_total_dough" style={styles.totalsValue}>
					{Math.round(result.totalDoughGrams)}g
				</Text>
			</View>
		</View>
	</View>
);

const styles = StyleSheet.create({
	header: {
		color: "#7cffb2",
		fontSize: 17,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 18,
	},
	block: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 20,
	},
	stepLabel: {
		color: "#7cffb2",
		fontSize: 14,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 14,
	},
	gap: { height: 12 },
	tableHeader: {
		flexDirection: "row",
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	headerCell: { color: "#555", fontSize: 13, textTransform: "uppercase" },
	row: {
		flexDirection: "row",
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	prefermentRow: {
		backgroundColor: "#0d1f0d",
		marginHorizontal: -20,
		paddingHorizontal: 20,
	},
	name: { color: "#aaa", fontSize: 18 },
	grams: { color: "#e0e0e0", fontSize: 18, fontWeight: "bold" },
	pct: { color: "#666", fontSize: 16 },
	prefermentText: { color: "#7cffb2" },
	totalsRow: {
		flexDirection: "row",
		marginTop: 12,
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 14,
		gap: 16,
	},
	totalsItem: { flex: 1 },
	totalsLabel: { color: "#555", fontSize: 12, textTransform: "uppercase" },
	totalsValue: { color: "#888", fontSize: 14, marginTop: 4 },
});
