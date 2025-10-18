module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      'react-native-reanimated/plugin',
      ['module:react-native-dotenv', {
        'env': ['API_KEY'],
        'moduleName': '@env',
        'path': '.env',
        'safe': false,
        'allowUndefined': true
      }],
      'nativewind/babel'
    ]
  };
};