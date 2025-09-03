const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  target: ['web', 'es5'],
  entry: {
    'extension.client': './src/extension.client.ts',
    'server.worker': './src/server/server.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.ne'],
    fallback: { fs: false, path: false }
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.ne$/, use: 'nearley-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.html$/, use: 'raw-loader' }
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
