import { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import type { IngredientType } from "@/types/recipe";

const TYPE_OPTIONS: IngredientType[] = ["water", "yeast", "salt", "other"];

type Props = {
	name: string;
	grams: string;
	type?: IngredientType;
	ingredientId?: string;
	onNameChange?: (value: string) => void;
	onGramsChange: (value: string) => void;
	onPercentageChange: (value: string) => void;
	onTypeChange?: (type: IngredientType) => void;
	onDelete?: () => void;
	locked?: boolean;
};

export const IngredientRow = ({
	name,
	grams,
	type,
	ingredientId,
	onNameChange,
	onGramsChange,
	onPercentageChange,
	onTypeChange,
	onDelete,
	locked = false,
}: Props) => {
	const gramsNum = parseFloat(grams) || 0;
	const derivedPct = (gramsNum / 10).toFixed(1);
	const [pctDisplay, setPctDisplay] = useState(derivedPct);

	useEffect(() => {
		setPctDisplay(derivedPct);
	}, [derivedPct]);

	return (
		<View style={styles.wrapper}>
			<View style={styles.row}>
				{locked || !onNameChange ? (
					<Text style={[styles.cell, styles.nameText]}>{name}</Text>
				) : (
					<TextInput
						style={[styles.cell, styles.input]}
						value={name}
						onChangeText={onNameChange}
						placeholder="Ingredient"
						placeholderTextColor="#555"
					/>
				)}
				<TextInput
					style={[styles.cell, styles.input, styles.numericCell]}
					value={grams}
					onChangeText={onGramsChange}
					keyboardType="decimal-pad"
					placeholder="0"
					placeholderTextColor="#555"
					testID={ingredientId ? `grams-${ingredientId}` : undefined}
				/>
				<TextInput
					style={[styles.cell, styles.input, styles.numericCell]}
					value={pctDisplay}
					onChangeText={setPctDisplay}
					onBlur={() => onPercentageChange(pctDisplay)}
					keyboardType="decimal-pad"
					placeholder="0"
					placeholderTextColor="#555"
				/>
				<View style={styles.deleteCell}>
					{onDelete ? (
						<TouchableOpacity onPress={onDelete}>
							<Text style={styles.deleteBtn}>✕</Text>
						</TouchableOpacity>
					) : (
						<Text style={styles.lockIcon}>🔒</Text>
					)}
				</View>
			</View>

			{!locked && onTypeChange && (
				<View style={styles.typeRow}>
					{TYPE_OPTIONS.map((t) => (
						<TouchableOpacity
							key={t}
							style={[styles.typeChip, type === t && styles.typeChipActive]}
							onPress={() => onTypeChange(t)}
						>
							<Text
								style={[
									styles.typeChipText,
									type === t && styles.typeChipTextActive,
								]}
							>
								{t}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: { marginBottom: 8 },
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	cell: { flex: 2 },
	numericCell: { flex: 1, textAlign: "right" },
	nameText: {
		color: "#666",
		fontSize: 15,
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: "#1a1a2e",
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#222",
	},
	input: {
		backgroundColor: "#1a1a2e",
		borderRadius: 6,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		color: "#7c9fff",
		fontSize: 15,
		paddingVertical: 10,
		paddingHorizontal: 12,
	},
	deleteCell: { width: 28, alignItems: "center" },
	deleteBtn: { color: "#ff7c7c", fontSize: 18 },
	lockIcon: { fontSize: 14 },
	typeRow: {
		flexDirection: "row",
		gap: 6,
		marginTop: 4,
		paddingLeft: 4,
	},
	typeChip: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		backgroundColor: "#1a1a2e",
	},
	typeChipActive: {
		borderColor: "#7c9fff",
		backgroundColor: "#1a1a40",
	},
	typeChipText: { color: "#555", fontSize: 11 },
	typeChipTextActive: { color: "#7c9fff", fontWeight: "bold" },
});
