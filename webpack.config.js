const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  target: 'web',
  entry: {
    'extension.client': './src/extension.client.ts',
    'server.worker': process.env.SERVER_WORKER_PATH || './src/server/server.worker.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    globalObject: 'self',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.ne'],
    fallback: { fs: false, path: false }
  },
  externals: { vscode: 'commonjs vscode' },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.ne$/, use: 'nearley-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.html$/, use: 'raw-loader' },
      {
        test: /\.worker\.ts$/,
        use: [
          { loader: 'worker-loader', options: { esModule: true, filename: '[name].js' } },
          'ts-loader'
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      SERVER_WORKER_PATH: JSON.stringify(process.env.SERVER_WORKER_PATH || './src/server/server.worker.ts')
    }),
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
