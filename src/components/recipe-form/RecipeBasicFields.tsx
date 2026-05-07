import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import type { DoughMethod } from "@/types/recipe";

const METHODS: DoughMethod[] = ["direct", "biga", "autolyse"];

type Props = {
	name: string;
	ballWeight: string;
	doughMethod: DoughMethod;
	prefermentFlourPct: string;
	prefermentHydration: string;
	bigaYeastPercentOnBigaFlour: string;
	autolyseWaterPct: string;
	onNameChange: (v: string) => void;
	onBallWeightChange: (v: string) => void;
	onDoughMethodChange: (v: DoughMethod) => void;
	onPrefermentFlourPctChange: (v: string) => void;
	onPrefermentHydrationChange: (v: string) => void;
	onBigaYeastPctChange: (v: string) => void;
	onAutolyseWaterPctChange: (v: string) => void;
};

export const RecipeBasicFields = ({
	name,
	ballWeight,
	doughMethod,
	prefermentFlourPct,
	prefermentHydration,
	bigaYeastPercentOnBigaFlour,
	autolyseWaterPct,
	onNameChange,
	onBallWeightChange,
	onDoughMethodChange,
	onPrefermentFlourPctChange,
	onPrefermentHydrationChange,
	onBigaYeastPctChange,
	onAutolyseWaterPctChange,
}: Props) => {
	return (
		<View>
			<View style={styles.row}>
				<View style={{ flex: 2 }}>
					<Text style={styles.label}>Recipe name</Text>
					<TextInput
						style={styles.input}
						value={name}
						onChangeText={onNameChange}
						placeholder="e.g. Neapolitan"
						placeholderTextColor="#555"
						testID="recipe_name_input"
					accessibilityLabel="recipe_name_input"
					/>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.label}>Ball weight (g)</Text>
					<TextInput
						style={styles.input}
						value={ballWeight}
						onChangeText={onBallWeightChange}
						keyboardType="decimal-pad"
						placeholder="280"
						placeholderTextColor="#555"
						testID="ball-weight-input"
					/>
				</View>
			</View>

			<View style={styles.methodSection}>
				<Text style={styles.label}>Dough Method</Text>
				<View style={styles.toggle}>
					{METHODS.map((m) => (
						<TouchableOpacity
							key={m}
							testID={`method_${m}`}
							accessibilityLabel={`method_${m}`}
							style={[styles.option, doughMethod === m && styles.optionActive]}
							onPress={() => onDoughMethodChange(m)}
						>
							<Text
								style={[
									styles.optionText,
									doughMethod === m && styles.optionTextActive,
								]}
							>
								{m.charAt(0).toUpperCase() + m.slice(1)}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>

			{doughMethod === "biga" && (
				<View style={styles.paramsBox}>
					<Text style={styles.paramsTitle}>Biga Parameters</Text>
					<View style={styles.paramRow}>
						<View style={styles.paramField}>
							<Text style={styles.label}>Preferment Flour %</Text>
							<TextInput
								style={styles.input}
								value={prefermentFlourPct}
								onChangeText={onPrefermentFlourPctChange}
								keyboardType="decimal-pad"
								placeholder="40"
								placeholderTextColor="#555"
								testID="preferment-flour-pct"
							/>
						</View>
						<View style={styles.paramField}>
							<Text style={styles.label}>Preferment Hydration %</Text>
							<TextInput
								style={styles.input}
								value={prefermentHydration}
								onChangeText={onPrefermentHydrationChange}
								keyboardType="decimal-pad"
								placeholder="45"
								placeholderTextColor="#555"
								testID="preferment-hydration"
							/>
						</View>
					</View>
					<View style={styles.paramField}>
						<Text style={styles.label}>Biga Yeast % on Biga Flour</Text>
						<TextInput
							style={styles.input}
							value={bigaYeastPercentOnBigaFlour}
							onChangeText={onBigaYeastPctChange}
							keyboardType="decimal-pad"
							placeholder="0.2"
							placeholderTextColor="#555"
							testID="biga-yeast-pct"
						/>
						<Text style={styles.hint}>
							e.g. 0.2 means 0.2% of biga flour weight
						</Text>
					</View>
				</View>
			)}

			{doughMethod === "autolyse" && (
				<View style={styles.paramsBox}>
					<Text style={styles.paramsTitle}>Autolyse Parameters</Text>
					<View style={styles.paramField}>
						<Text style={styles.label}>Autolyse Water %</Text>
						<TextInput
							style={styles.input}
							value={autolyseWaterPct}
							onChangeText={onAutolyseWaterPctChange}
							keyboardType="decimal-pad"
							placeholder="100"
							placeholderTextColor="#555"
							testID="autolyse-water-pct"
						/>
						<Text style={styles.hint}>
							% of total water used in the autolyse step (default 100%)
						</Text>
					</View>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: 14, marginBottom: 20 },
	methodSection: { marginBottom: 20 },
	paramsBox: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 14,
		marginBottom: 20,
	},
	paramsTitle: {
		color: "#7c9fff",
		fontSize: 11,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 12,
	},
	paramRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
	paramField: { flex: 1, marginBottom: 10 },
	hint: { color: "#555", fontSize: 11, marginTop: 4 },
	label: {
		color: "#888",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	toggle: {
		flexDirection: "row",
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 4,
	},
	option: { flex: 1, borderRadius: 6, padding: 11, alignItems: "center" },
	optionActive: { backgroundColor: "#7c9fff" },
	optionText: { color: "#666", fontSize: 14 },
	optionTextActive: { color: "#000", fontWeight: "bold" },
	input: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		color: "#e0e0e0",
		fontSize: 15,
		paddingVertical: 12,
		paddingHorizontal: 14,
	},
});
