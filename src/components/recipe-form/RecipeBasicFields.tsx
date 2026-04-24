import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
	name: string;
	ballWeight: string;
	onNameChange: (v: string) => void;
	onBallWeightChange: (v: string) => void;
};

export const RecipeBasicFields = ({
	name,
	ballWeight,
	onNameChange,
	onBallWeightChange,
}: Props) => {
	return (
		<View style={styles.row}>
			<View style={{ flex: 2 }}>
				<Text style={styles.label}>Recipe name</Text>
				<TextInput
					style={styles.input}
					value={name}
					onChangeText={onNameChange}
					placeholder="e.g. Neapolitan"
					placeholderTextColor="#555"
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
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: 14, marginBottom: 20 },
	label: {
		color: "#888",
		fontSize: 13,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
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
