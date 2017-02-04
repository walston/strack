var babelLoader = {
  test: /\.jsx?$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  query: {
    presets: ['latest']
  }
}

module.exports = {
  loaders: [
    babelLoader
  ],
  entry: {
    app: process.env.CLIENT_FOLDER + "/public/src/entry.js"
  },
  output: {
    publicPath: `localhost:${process.env.PORT || 8080}/js/`,
    path: process.env.CLIENT_FOLDER + "/public/js",
    filename: 'bundle.js'
  }
}
