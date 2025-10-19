// Simple metro config for Expo 49
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for import aliases
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
  'app': path.resolve(__dirname, 'app'),
  'components': path.resolve(__dirname, 'components'),
  'constants': path.resolve(__dirname, 'constants'),
  'services': path.resolve(__dirname, 'services')
};

// Add support for additional file types
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg', 'cjs', 'mjs'];

module.exports = config;