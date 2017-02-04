var babelLoader = {
  test: /\.jsx?$/,
  loader: 'babel-loader',
  query: {
    presets: ['react', 'latest']
  }
}

module.exports = {
  loaders: [
    babelLoader
  ],
  entry: {
    app: process.env.CLIENT_FOLDER + "/src/entry.js"
  },
  output: {
    publicPath: `localhost:${process.env.PORT || 8080}/js/`,
    path: process.env.CLIENT_FOLDER + "/dist/js",
    filename: 'bundle.js'
  }
}
