const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'web', // modern browsers for VS Code Web
  entry: {
    'extension.client': './src/extension.client.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd',
    globalObject: 'self', // required for workers
    clean: true,
    publicPath: ''
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
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.ne$/, use: 'nearley-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.html$/, use: 'raw-loader' },
      {
        test: /\.worker\.ts$/,
        use: [
          {
            loader: 'worker-loader',
            options: { esModule: true, filename: '[name].js' }
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
