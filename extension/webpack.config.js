const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
require('dotenv').config();

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    background: './src/background/background.ts',
    content:    './src/content/content.ts',
    popup:      './src/popup/popup.ts',
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
      FIREBASE_API_KEY:             JSON.stringify(process.env.FIREBASE_API_KEY),
      FIREBASE_AUTH_DOMAIN:         JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
      FIREBASE_PROJECT_ID:          JSON.stringify(process.env.FIREBASE_PROJECT_ID),
      FIREBASE_STORAGE_BUCKET:      JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
      FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
      FIREBASE_APP_ID:              JSON.stringify(process.env.FIREBASE_APP_ID),
      FIREBASE_MEASUREMENT_ID:      JSON.stringify(process.env.FIREBASE_MEASUREMENT_ID),
      GEMINI_API_KEY:               JSON.stringify(process.env.GEMINI_API_KEY),
      ELEVENLABS_API_KEY:           JSON.stringify(process.env.ELEVENLABS_API_KEY),
      ELEVENLABS_VOICE_ID:          JSON.stringify(process.env.ELEVENLABS_VOICE_ID),
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json',          to: 'manifest.json' },
        { from: 'src/popup/popup.html',   to: 'popup.html' },
        { from: 'src/popup/popup.css',    to: 'popup.css' },
        { from: 'src/content/styles.css', to: 'styles.css' },
      ],
    }),
  ],
};
