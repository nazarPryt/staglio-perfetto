import { ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import { type Href, useRouter } from "expo-router";

export default function Index() {
	const router = useRouter();

	return (
		<TouchableOpacity
			style={styles.container}
			onPress={() => router.replace("/(tabs)/recipes" as Href)}
			activeOpacity={1}
		>
			<ImageBackground
				source={require("@assets/images/main-screen.png")}
				style={styles.image}
				resizeMode="cover"
			/>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	image: {
		flex: 1,
	},
});
