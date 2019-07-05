/* eslint-disable */

const path = require('path');
const webpack = require('webpack');
const packageJson = require('../package.json');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

/**
 * @type {import('webpack').Configuration}
 */
const cfg = {
  mode: 'development',
  context: path.resolve(__dirname, '../src'),
  entry: {
    main: path.resolve(__dirname, '../src/main.js'),
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].[hash].js'
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
          compilerOptions: {
            preserveWhitespace: false
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: { chrome: 64, firefox: 58, edge: 15, safari: 11 } }]
          ],
          plugins: [
            ['component', { libraryName: 'element-ui', styleLibraryName: 'theme-chalk' }]
          ]
        }
      },
      {
        test: /\.(ttf|eot|woff2?)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      'assets': path.resolve(__dirname, '../assets')
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'S Dashboard Web Console'
    }),
    new webpack.DefinePlugin({ '__SDWC__VERSION__': `"${packageJson.version}"` })
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
  process.env.NODE_ENV = env.mode;
  if (process.env.NODE_ENV === 'production') {
    cfg.mode = 'production';
    cfg.devtool = 'source-map';
    cfg.module.rules[0].use = [
      { loader: MiniCSSExtractPlugin.loader },
      { loader: 'css-loader' }
    ];
    cfg.plugins.push(
      new MiniCSSExtractPlugin({ filename: 'style.[contenthash].css' }),
      new OptimizeCssAssetsPlugin()
    );
  }
  if (env.dev) {
    cfg.plugins.push(
      new webpack.DefinePlugin({ '__SDWC_DEV__': `true` })
    )
  }
  return cfg;
}
