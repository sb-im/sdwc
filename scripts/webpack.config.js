'use strict';

/* eslint-disable */

const path = require('path');
const cp = require('child_process');

const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');

const ProjectRoot = path.resolve(__dirname, '../');
const P = (...segments) => path.join(ProjectRoot, ...segments);
const packageJson = require(P('package.json'));

function resolveVersion() {
  let v = packageJson.version;
  try {
    v = cp.execSync(`git describe --long`, { encoding: 'utf8' }).trim();
  } catch (e) { /* noop */ }
  return v;
}

/**
 * @type {import('webpack').Configuration}
 */
const cfg = {
  mode: 'development',
  entry: {
    main: P('/src/main.js'),
  },
  output: {
    path: P('/dist'),
    filename: '[name].[contenthash].js',
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
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': P('/src'),
      'assets': P('/assets'),
      // use browser version mqtt.js
      'mqtt': 'mqtt/dist/mqtt.js'
    },
    fallback: {
      path: false
    }
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      title: 'S Dashboard Web Console'
    }),
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    new webpack.DefinePlugin({ __SDWC__VERSION__: `"${resolveVersion()}"` })
  ],
  devServer: {
    hot: true,
    liveReload: false,
    client: {
      overlay: true,
    },
    static: {
      publicPath: '/',
      directory: P('/')
    },
    proxy: {
      '/gosd': {
        target: process.env.SUPERDOCK_API_SERVER || 'https://demo.sblab.xyz/gosd',
        pathRewrite: { '^/gosd':  '' },
        changeOrigin: true
      }
    }
  },
  devtool: 'eval-cheap-module-source-map'
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
      { loader: MiniCssExtractPlugin.loader },
      { loader: 'css-loader' }
    ];
    cfg.optimization = {
      minimize: true,
      minimizer: [
        new CssMinimizerWebpackPlugin(),
        '...', // minimizer defaults, namely 'terser-webpack-plugin'
      ]
    };
    cfg.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'style.[contenthash].css',
        chunkFilename: '[name].[contenthash].css'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: P('/assets'), to: P('dist/assets') },
          { from: P('/assets/robots.txt'), to: P('dist/') },
          { from: P('/assets/favicon.ico'), to: P('dist/') }
        ]
      })
    );
  }
  // 'DEVELOPMENT' ribbon on left top corner
  cfg.plugins.push(
    new webpack.DefinePlugin({ '__SDWC_DEV__': env.dev ? `true` : `false` })
  )
  return cfg;
}
