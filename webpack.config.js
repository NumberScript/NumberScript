const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  // Target modern browsers + VS Code Web
  target: 'web',

  entry: {
    'extension.client': './src/extension.client.ts', // main extension
    'server.worker': './src/server/server.worker.ts' // worker entry
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',      // universal module definition
    globalObject: 'self',      // required for web workers
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

      // Nearley grammar files
      { test: /\.ne$/, use: 'nearley-loader' },

      // CSS files
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },

      // HTML files (raw-loader)
      { test: /\.html$/, use: 'raw-loader' },

      // Worker loader: handle *.worker.ts as web worker
      {
        test: /\.worker\.ts$/,
        use: [
          {
            loader: 'worker-loader',
            options: {
              filename: '[name].js', // preserve output name
              esModule: true
            }
          },
          'ts-loader'
        ],
        exclude: /node_modules/
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
