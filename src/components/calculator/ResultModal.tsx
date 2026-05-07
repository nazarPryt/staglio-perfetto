import { useKeepAwake } from "expo-keep-awake";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
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
			<SafeAreaView className="flex-1 bg-bg-modal">
				<View className="flex-1 p-5">
					<View className="flex-row items-center justify-between mb-6">
						<Text className="text-accent-green text-xl font-bold uppercase tracking-label">
							Recipe Preview
						</Text>
						<Pressable onPress={onClose}>
							<Card className="py-2.5 px-4">
								<Text className="text-content-primary text-base">✕ Close</Text>
							</Card>
						</Pressable>
					</View>
					{result.kind === "single" && (
						<ResultTable result={result} mode={mode} header={header} />
					)}
					{result.kind === "two-step" && (
						<TwoStepResult result={result} header={header} />
					)}
					<Text className="text-content-ghost text-label text-center mt-6">
						Screen stays on while this is open.
					</Text>
				</View>
			</SafeAreaView>
		</Modal>
	);
};
