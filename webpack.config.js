const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  // Web + Node target for VS Code web extensions
  target: 'web', // remove 'es5' for modern browsers, ES2020 is fine
  entry: {
    'extension.client': './src/extension.client.ts', // main extension
    'server.worker': './src/server/server.ts'        // worker
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',   // universal module definition
    globalObject: 'self',   // required for web workers
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
    vscode: 'commonjs vscode' // prevent bundling VS Code API
  },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.ne$/, use: 'nearley-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.html$/, use: 'raw-loader' },
      {
        test: /\.worker\.ts$/,
        use: { loader: 'worker-loader' } // Webpack loader for workers
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
