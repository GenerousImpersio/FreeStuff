const webpack = require('webpack');
const path = require('path');
const RemovePlugin = require('remove-files-webpack-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin({
  disable: true
});


const buildPath = path.resolve(__dirname, 'dist');

const server = smp.wrap({
  entry: './src/server/server.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader', 'eslint-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new RemovePlugin({
      before: {
        include: [
          path.resolve(buildPath, 'server')
        ]
      },
      watch: {
        include: [
          path.resolve(buildPath, 'server')
        ]
      }
    })
  ],
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[contenthash].server.js',
    path: path.resolve(buildPath, 'server')
  },
  target: 'node',
});

const client = smp.wrap({
  entry: './src/client/client.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader', 'eslint-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new RemovePlugin({
      before: {
        include: [
          path.resolve(buildPath, 'client')
        ]
      },
      watch: {
        include: [
          path.resolve(buildPath, 'client')
        ]
      }
    })
  ],
  optimization: {
    minimize: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[contenthash].client.js',
    path: path.resolve(buildPath, 'client'),
  },
});

module.exports = [server, client];
