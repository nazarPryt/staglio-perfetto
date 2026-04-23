import { Tabs } from "expo-router";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: true,
				tabBarActiveTintColor: "#7c9fff",
			}}
		>
			<Tabs.Screen
				name="recipes"
				options={{ title: "Recipes", tabBarLabel: "Recipes" }}
			/>
			<Tabs.Screen
				name="calculator"
				options={{ title: "Calculator", tabBarLabel: "Calculator" }}
			/>
		</Tabs>
	);
}
