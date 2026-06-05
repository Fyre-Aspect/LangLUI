const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
require('dotenv').config();

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    background: './src/background/background.ts',
    content: './src/content/content.ts',
    popup: './src/popup/popup.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      GEMINI_API_KEY: JSON.stringify(process.env.GEMINI_API_KEY),
      ELEVENLABS_API_KEY: JSON.stringify(process.env.ELEVENLABS_API_KEY),
      ELEVENLABS_VOICE_ID: JSON.stringify(process.env.ELEVENLABS_VOICE_ID),
      INSERTKEY: JSON.stringify(process.env.INSERTKEY),
      FIREBASEAUTHDOMAIN: JSON.stringify(process.env.FIREBASEAUTHDOMAIN),
      PROJECTID: JSON.stringify(process.env.PROJECTID),
      STORAGEBUCKET: JSON.stringify(process.env.STORAGEBUCKET),
      SENDERID: JSON.stringify(process.env.SENDERID),
      APPID: JSON.stringify(process.env.APPID),
      MEASUREMENTID: JSON.stringify(process.env.MEASUREMENTID),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup.html' },
        { from: 'src/popup/popup.css', to: 'popup.css' },
        { from: 'src/content/styles.css', to: 'styles.css' },
      ],
    }),
  ],
};
