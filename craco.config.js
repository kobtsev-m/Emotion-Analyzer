const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          fs: false
        }
      }
    },
    plugins: [
      new NodePolyfillPlugin({
        excludeAliases: ['console']
      })
    ]
  }
};
