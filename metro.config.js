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

module.exports = config;
