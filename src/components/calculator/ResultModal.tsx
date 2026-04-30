import { useKeepAwake } from "expo-keep-awake";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DoughCalcResult, Mode } from "@/types/recipe";
import { ResultTable } from "./ResultTable";
import { TwoStepResult } from "./TwoStepResult";

type Props = {
	visible: boolean;
	result: DoughCalcResult;
	mode: Mode;
	header: string;
	onClose: () => void;
};

const KeepAwake = () => {
	useKeepAwake();
	return null;
};

export const ResultModal = ({
	visible,
	result,
	mode,
	header,
	onClose,
}: Props) => {
	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose}>
			{visible && <KeepAwake />}
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.container}>
					<View style={styles.topBar}>
						<Text style={styles.title}>Recipe Preview</Text>
						<Pressable onPress={onClose} style={styles.closeButton}>
							<Text style={styles.closeText}>✕ Close</Text>
						</Pressable>
					</View>
					{result.kind === "single" && (
						<ResultTable result={result} mode={mode} header={header} />
					)}
					{result.kind === "two-step" && (
						<TwoStepResult result={result} header={header} />
					)}
					<Text style={styles.hint}>Screen stays on while this is open.</Text>
				</View>
			</SafeAreaView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#0d0d1a" },
	container: { flex: 1, padding: 20 },
	topBar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 24,
	},
	title: {
		color: "#7cffb2",
		fontSize: 20,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	closeButton: {
		backgroundColor: "#1a1a2e",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#2a2a4a",
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	closeText: { color: "#e0e0e0", fontSize: 16 },
	hint: {
		color: "#444",
		fontSize: 13,
		textAlign: "center",
		marginTop: 24,
	},
});
