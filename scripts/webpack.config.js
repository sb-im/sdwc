'use strict';

/* eslint-disable */

const path = require('path');
const cp = require('child_process');

const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const packageJson = require('../package.json');

function resolveVersion(hash) {
  let v = packageJson.version;
  try {
    v = cp.execSync(`git describe --long`, { encoding: 'utf8' }).trim();
    if (!hash) v = v.replace(/-g[0-9a-f]+$/, '');
  } catch (e) { /* noop */ }
  return v;
}

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
    filename: '[name].[hash].js',
    chunkFilename: '[name].[contenthash].js',
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
    new webpack.DefinePlugin({ '__SDWC__VERSION__': `"${resolveVersion(true)}"` })
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
 * @param {{mode: 'development'|'production'; dev?: true}} env
 * @param {string[]} argv
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
      new MiniCSSExtractPlugin({
        filename: 'style.[contenthash].css',
        chunkFilename: '[name].[contenthash].css'
      }),
      new OptimizeCssAssetsPlugin()
    );
  }
  // 'DEVELOPMENT' ribbon on left top corner
  cfg.plugins.push(
    new webpack.DefinePlugin({ '__SDWC_DEV__': env.dev ? `true` : `false` })
  )
  return cfg;
}
