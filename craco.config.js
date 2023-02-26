const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

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
      }),
      new CopyPlugin({
        patterns: [
          {
            from: './public/static/js',
            to: 'static/js'
          }
        ]
      })
    ]
  }
};
