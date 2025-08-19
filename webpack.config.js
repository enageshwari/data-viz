const path = require('path');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: './src/renderer.tsx',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'renderer.js',
    library: {
      type: 'module'
    }
  },
  experiments: {
    outputModule: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};