/* eslint-disable */

const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

/**
 * @type {import('webpack').Configuration}
 */
const cfg = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: { preserveWhitespace: false }
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(ttf|eot|woff|png|jpe?g|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'assets': path.resolve(__dirname, 'assets')
    }
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  devServer: {
    hot: true,
    overlay: true,
    stats: 'errors-only'
  },
  performance: {
    hints: false
  },
  stats: {
    all: false,
    assets: true,
    errors: true,
    version: true
  },
  devtool: 'cheap-module-eval-source-map'
}

/**
 * @see https://webpack.js.org/configuration/configuration-types/#exporting-a-function
 */
module.exports = function (env, argv) {
  process.env.NODE_ENV = env;
  if (process.env.NODE_ENV === 'production') {
    cfg.mode = 'production';
    cfg.devtool = 'source-map';
    cfg.module.rules[0].use = [
      { loader: MiniCSSExtractPlugin.loader },
      { loader: 'css-loader' }
    ];
    cfg.plugins.push(
      new MiniCSSExtractPlugin({ filename: 'style.css' }),
      new OptimizeCssAssetsPlugin()
    );
  }
  return cfg;
}
