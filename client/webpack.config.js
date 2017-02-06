const webpack = require('webpack');

var reactLoader = {
  test: /\.jsx?$/,
  loader: 'babel-loader',
  query: {
    presets: ['latest', 'react']
  }
}

module.exports = {
  entry: {
    app: process.env.CLIENT_FOLDER + "/src/entry.js"
  },
  output: {
    publicPath: `localhost:${process.env.PORT || 8080}/js/`,
    path: process.env.CLIENT_FOLDER + "/dist/js",
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      reactLoader
    ]
  }
}
