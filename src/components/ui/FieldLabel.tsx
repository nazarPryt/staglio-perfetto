import type { ReactNode } from "react";
import { Text } from "react-native";

export const FieldLabel = ({ children }: { children: ReactNode }) => (
	<Text className="text-content-muted text-label uppercase tracking-label mb-1.5">
		{children}
	</Text>
);
