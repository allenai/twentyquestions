/* Configuration for Webpack */

// imports
const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


const paths = {
  dist: path.resolve(__dirname, 'dist'),
  src: path.resolve(__dirname, 'src'),
  index: path.resolve(__dirname, 'src/index.html'),
  app: path.resolve(__dirname, 'src/app.js'),
  node_modules: path.resolve(__dirname, 'node_modules')
};


module.exports = {
  entry: paths.app,
  output: {
    filename: 'twenty-questions/static/twentyquestions/waitingroom.bundle.js',
    path: paths.dist
  },
  devtool: 'inline-source-map',
  devServer: {
    index: 'waitingroom.html',
    historyApiFallback: {
      rewrites: [ { from: /./, to: '/' } ]
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: paths.node_modules,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: 'css-loader'
        })
      },
      {
        test: /\.(svg|png|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'waitingroom.html',
      template: paths.index,
      inject: false
    }),
    new ExtractTextPlugin('style.bundle.css')
  ]
};
