const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

 module.exports = {
   mode: 'development',
   entry: '/src/index.js',
   devtool: 'inline-source-map',
   output: {
     filename: 'index.js',
     path: path.resolve(__dirname, 'dist'),
     clean: true,
   },
   module: {
     rules: [
       {
         test: /\.css$/i,
         use: ['style-loader', 'css-loader'],
       },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'assets',
      },
     ],
   },
   plugins: [
      new CopyPlugin({
        patterns: [
          { from: "src/assets", to: "assets" },
          { from: path.resolve(__dirname, "src/index.html")},
          { from: path.resolve(__dirname, "src/_config.yml")}
        ],
      }),
    //new HtmlWebpackPlugin()
    ],
 };