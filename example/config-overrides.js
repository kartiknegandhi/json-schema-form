const webpack = require("webpack");
module.exports = function override(config, env) {
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );
  config.resolve.fallback = {
    crypto: require.resolve("crypto-browserify"),
    buffer: require.resolve("buffer"),
    stream: require.resolve("stream-browserify"),
    vm: require.resolve("vm-browserify"),
  };

  return config;
};
