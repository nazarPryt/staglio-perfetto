import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#7c9fff",
				tabBarInactiveTintColor: "#555",
				tabBarStyle: {
					backgroundColor: "#0f0f1a",
					borderTopColor: "#2a2a4a",
				},
			}}
		>
			<Tabs.Screen
				name="recipes"
				options={{
					title: "Recipes",
					tabBarLabel: "Recipes",
					tabBarButtonTestID: "tab_recipes",
					tabBarAccessibilityLabel: "tab_recipes",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="restaurant-outline" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="calculator"
				options={{
					title: "Calculator",
					tabBarLabel: "Calculator",
					tabBarButtonTestID: "tab_calculator",
					tabBarAccessibilityLabel: "tab_calculator",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="calculator-outline" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
