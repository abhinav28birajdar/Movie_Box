const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { resolver, transformer } = defaultConfig;

// Add support for import aliases
const extraNodeModules = {
  '@': path.resolve(__dirname),
  'app': path.resolve(__dirname, 'app'),
  'components': path.resolve(__dirname, 'components'),
  'constants': path.resolve(__dirname, 'constants'),
  'services': path.resolve(__dirname, 'services')
};

// NativeWind configuration
defaultConfig.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('nativewind/dist/babel')
};

defaultConfig.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg', 'cjs', 'mjs'],
  extraNodeModules
};

module.exports = defaultConfig;