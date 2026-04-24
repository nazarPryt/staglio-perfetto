import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
		<View style={styles.section}>
			<Text style={styles.label}>Recipe</Text>
			<TouchableOpacity
				style={styles.picker}
				onPress={() => setOpen((v) => !v)}
			>
				<Text style={styles.pickerText}>{selected?.name ?? "Select…"}</Text>
				<Text style={styles.pickerChevron}>▾</Text>
			</TouchableOpacity>
			{open && (
				<View style={styles.pickerDropdown}>
					{recipes.map((r) => (
						<TouchableOpacity
							key={r.id}
							style={styles.pickerOption}
							onPress={() => {
								onSelect(r.id);
								setOpen(false);
							}}
						>
							<Text style={styles.pickerOptionText}>{r.name}</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
			{selected && totalDoughPerKg && (
				<Text style={styles.hint}>
					Ball weight: {selected.ballWeight}g · Dough per 1kg flour:{" "}
					{totalDoughPerKg}g
				</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	section: { marginBottom: 20 },
	label: {
		color: "#888",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	hint: { color: "#555", fontSize: 13, marginTop: 6 },
	picker: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 14,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	pickerText: { color: "#e0e0e0", fontSize: 15 },
	pickerChevron: { color: "#888" },
	pickerDropdown: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		marginTop: 4,
	},
	pickerOption: {
		padding: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#2a2a4a",
	},
	pickerOptionText: { color: "#e0e0e0", fontSize: 15 },
});
