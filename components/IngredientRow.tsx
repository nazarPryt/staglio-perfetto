// components/IngredientRow.tsx
import { useEffect, useState } from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

type Props = {
	name: string;
	grams: string;
	onNameChange?: (value: string) => void;
	onGramsChange: (value: string) => void;
	onPercentageChange: (value: string) => void;
	onDelete?: () => void;
	locked?: boolean;
};

export default function IngredientRow({
	name,
	grams,
	onNameChange,
	onGramsChange,
	onPercentageChange,
	onDelete,
	locked = false,
}: Props) {
	const gramsNum = parseFloat(grams) || 0;
	const derivedPct = (gramsNum / 10).toFixed(1);
	const [pctDisplay, setPctDisplay] = useState(derivedPct);

	// Sync display when grams changes externally (e.g. parent resets state)
	useEffect(() => {
		setPctDisplay(derivedPct);
	}, [derivedPct]);

	return (
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
				editable={!locked}
				placeholder="0"
				placeholderTextColor="#555"
			/>
			<TextInput
				style={[styles.cell, styles.input, styles.numericCell]}
				value={pctDisplay}
				onChangeText={setPctDisplay}
				onBlur={() => onPercentageChange(pctDisplay)}
				keyboardType="decimal-pad"
				editable={!locked}
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
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 6,
	},
	cell: {
		flex: 2,
	},
	numericCell: {
		flex: 1,
		textAlign: "right",
	},
	nameText: {
		color: "#666",
		fontSize: 13,
		paddingVertical: 8,
		paddingHorizontal: 10,
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
		fontSize: 13,
		paddingVertical: 7,
		paddingHorizontal: 10,
	},
	deleteCell: {
		width: 24,
		alignItems: "center",
	},
	deleteBtn: {
		color: "#ff7c7c",
		fontSize: 16,
	},
	lockIcon: {
		fontSize: 12,
	},
});
