module.exports = function (api) {
    api.cache(true);
    return {
      presets: ["babel-preset-expo"],
      plugins: [
        ["module:react-native-dotenv", {
          "env": ["API_KEY"],
          "moduleName": "@env",
          "path": ".env",
          "safe": false,
          "allowUndefined": true
        }],
        // NativeWind v4 setup
        "nativewind/babel"
      ]
    };
  };