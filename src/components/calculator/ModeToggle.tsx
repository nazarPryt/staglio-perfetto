import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Mode } from "@/types/recipe";

type Props = {
	mode: Mode;
	onChange: (mode: Mode) => void;
};

export const ModeToggle = ({ mode, onChange }: Props) => {
	return (
		<View style={styles.section}>
			<Text style={styles.label}>Mode</Text>
			<View style={styles.toggle}>
				<TouchableOpacity
					style={[styles.option, mode === "by-count" && styles.optionActive]}
					onPress={() => onChange("by-count")}
				>
					<Text
						style={[
							styles.optionText,
							mode === "by-count" && styles.optionTextActive,
						]}
					>
						How many balls?
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.option, mode === "by-flour" && styles.optionActive]}
					onPress={() => onChange("by-flour")}
				>
					<Text
						style={[
							styles.optionText,
							mode === "by-flour" && styles.optionTextActive,
						]}
					>
						Flour available
					</Text>
				</TouchableOpacity>
			</View>
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
});
