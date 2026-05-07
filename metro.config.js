const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
	/node_modules\/.*\/node_modules\/react-native\/.*/,
];

config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	"@": path.resolve(__dirname, "src"),
	"@assets": path.resolve(__dirname, "assets"),
};

// Force zustand to use CJS on web — the ESM build uses import.meta which Metro doesn't support
const zustandRoot = path.dirname(require.resolve("zustand/package.json"));
const zustandCjs = {
	zustand: path.join(zustandRoot, "index.js"),
	"zustand/middleware": path.join(zustandRoot, "middleware.js"),
	"zustand/vanilla": path.join(zustandRoot, "vanilla.js"),
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
	if (platform === "web" && zustandCjs[moduleName]) {
		return { type: "sourceFile", filePath: zustandCjs[moduleName] };
	}
	return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
