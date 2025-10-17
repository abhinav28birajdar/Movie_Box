// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// Get the Metro config
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add additional resolvers
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'cjs', 'json', 'mjs'];

// Add support for import aliases
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
  'app': path.resolve(__dirname, 'app'),
  'components': path.resolve(__dirname, 'components'),
  'constants': path.resolve(__dirname, 'constants'),
  'services': path.resolve(__dirname, 'services')
};

module.exports = withNativeWind(config, { input: './global.css' });