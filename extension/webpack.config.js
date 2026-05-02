const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
      FIREBASE_API_KEY:             JSON.stringify('AIzaSyBeoK3maD-HOG_-KibN47AqzRUGxUhfW9c'),
      FIREBASE_AUTH_DOMAIN:         JSON.stringify('langlua-f910b.firebaseapp.com'),
      FIREBASE_PROJECT_ID:          JSON.stringify('langlua-f910b'),
      FIREBASE_STORAGE_BUCKET:      JSON.stringify('langlua-f910b.firebasestorage.app'),
      FIREBASE_MESSAGING_SENDER_ID: JSON.stringify('722900477082'),
      FIREBASE_APP_ID:              JSON.stringify('1:722900477082:web:e35dfa96ebd3946636eb23'),
      FIREBASE_MEASUREMENT_ID:      JSON.stringify('G-3HMGQRCZH2'),
      GEMINI_API_KEY:               JSON.stringify('AIzaSyC0NDbA1GhusH5YHr2f4L7YhUMK5O94PyU'),
      ELEVENLABS_API_KEY:           JSON.stringify('sk_8a7a2a8957bb806497506a635b22f970080797881992ea28'),
      ELEVENLABS_VOICE_ID:          JSON.stringify('pNInz6obpgDQGcFmaJgB'),
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
