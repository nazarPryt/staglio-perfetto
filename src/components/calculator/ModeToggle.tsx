import { View } from "react-native";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import type { Mode } from "@/types/recipe";

type Props = {
	mode: Mode;
	onChange: (mode: Mode) => void;
};

const MODE_OPTIONS = [
	{
		value: "by-count" as Mode,
		label: "How many balls?",
		testID: "mode_by_count",
	},
	{
		value: "by-flour" as Mode,
		label: "Flour available",
		testID: "mode_by_flour",
	},
];

export const ModeToggle = ({ mode, onChange }: Props) => (
	<View className="mb-5">
		<FieldLabel>Mode</FieldLabel>
		<ToggleGroup options={MODE_OPTIONS} value={mode} onChange={onChange} />
	</View>
);
