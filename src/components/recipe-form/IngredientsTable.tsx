import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { REQUIRED_IDS } from "@/bll/ingredientUtils";
import { IngredientRow } from "@/components/IngredientRow";
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
			<Text style={styles.label}>Ingredients for 1 kg of flour</Text>

			<View style={styles.tableHeader}>
				<Text style={[styles.headerCell, { flex: 2 }]}>Ingredient</Text>
				<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>
					Grams
				</Text>
				<Text style={[styles.headerCell, { flex: 1, textAlign: "right" }]}>
					%
				</Text>
				<View style={{ width: 24 }} />
			</View>

			<View style={styles.flourRow}>
				<Text style={[styles.lockedCell, { flex: 2 }]}>Flour</Text>
				<Text style={[styles.lockedCell, { flex: 1, textAlign: "right" }]}>
					1000
				</Text>
				<Text style={[styles.lockedCell, { flex: 1, textAlign: "right" }]}>
					100%
				</Text>
				<View style={{ width: 24 }} />
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
				<Text style={styles.addBtn}>+ Add ingredient</Text>
			</TouchableOpacity>

			<View style={styles.totalRow}>
				<Text style={styles.totalLabel}>Total dough per 1 kg flour</Text>
				<Text style={styles.totalValue}>{totalDough.toFixed(0)} g</Text>
			</View>
		</>
	);
};

const styles = StyleSheet.create({
	label: {
		color: "#888",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	tableHeader: {
		flexDirection: "row",
		paddingHorizontal: 4,
		marginBottom: 6,
		marginTop: 10,
	},
	headerCell: { color: "#555", fontSize: 12, textTransform: "uppercase" },
	flourRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
		paddingHorizontal: 4,
	},
	lockedCell: {
		color: "#666",
		fontSize: 15,
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#1a1a2e",
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#222",
	},
	addBtn: { color: "#7c9fff", fontSize: 15, marginTop: 10, marginBottom: 18 },
	totalRow: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		padding: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 24,
	},
	totalLabel: { color: "#888", fontSize: 15 },
	totalValue: { color: "#7cffb2", fontSize: 16, fontWeight: "bold" },
});
