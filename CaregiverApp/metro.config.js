const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude backend directory and its node_modules from Metro bundling
config.resolver.blockList = [
  /backend\/.*/,
  /backend\/node_modules\/.*/,
];

// Ensure we don't traverse into backend directory
config.watchFolders = [
  path.resolve(__dirname),
];

config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;