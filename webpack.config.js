const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  target: 'web', // VS Code web extensions
  entry: {
    'extension.client': './src/extension.client.ts' // main extension
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    globalObject: 'self', // needed for Web Workers
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.ne'],
    fallback: {
      fs: false,
      path: false
    }
  },
  externals: {
    vscode: 'commonjs vscode' // do not bundle VS Code API
  },
  module: {
    rules: [
      // TypeScript
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },

      // Nearley grammars
      { test: /\.ne$/, use: 'nearley-loader' },

      // Styles
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },

      // HTML
      { test: /\.html$/, use: 'raw-loader' },

      // Web Worker
      {
        test: /\.worker\.ts$/,
        use: [
          {
            loader: 'worker-loader',
            options: { esModule: true, filename: '[name].js' }
          },
          'ts-loader'
        ]
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/webviews', to: 'webviews', noErrorOnMissing: true },
        { from: 'resources', to: 'resources', noErrorOnMissing: true }
      ]
    })
  ],
  optimization: { splitChunks: false },
  devtool: 'source-map'
};
