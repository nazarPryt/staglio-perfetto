import type { ReactNode } from "react";
import { View } from "react-native";

type Props = {
	children: ReactNode;
	className?: string;
};

export const Card = ({ children, className }: Props) => (
	<View
		className={`bg-bg-surface rounded-lg border border-border${className ? ` ${className}` : ""}`}
	>
		{children}
	</View>
);
