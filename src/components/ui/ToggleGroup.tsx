import { Text, TouchableOpacity, View } from "react-native";

type Option<T extends string> = {
	value: T;
	label: string;
	testID?: string;
};

type Props<T extends string> = {
	options: Option<T>[];
	value: T;
	onChange: (v: T) => void;
};

export const ToggleGroup = <T extends string>({
	options,
	value,
	onChange,
}: Props<T>) => (
	<View className="flex-row bg-bg-surface rounded-lg border border-border p-1">
		{options.map((opt) => (
			<TouchableOpacity
				key={opt.value}
				testID={opt.testID}
				accessibilityLabel={opt.testID}
				className={`flex-1 rounded-md p-[11px] items-center${value === opt.value ? " bg-accent-blue" : ""}`}
				onPress={() => onChange(opt.value)}
			>
				<Text
					className={
						value === opt.value
							? "text-black font-bold"
							: "text-content-disabled text-sm"
					}
				>
					{opt.label}
				</Text>
			</TouchableOpacity>
		))}
	</View>
);
