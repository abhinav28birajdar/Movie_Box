module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Expo Router uses React Navigation under the hood
      'expo-router/babel',
      // Reanimated plugin must be listed last
      ['module:react-native-dotenv', {
        'env': ['API_KEY'],
        'moduleName': '@env',
        'path': '.env',
        'safe': false,
        'allowUndefined': true
      }],
      'nativewind/babel',
      'react-native-reanimated/plugin'
    ]
  };
};