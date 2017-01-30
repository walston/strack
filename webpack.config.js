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
    app: "./public/src/entry.js"
  },
  output: {
    publicPath: `localhost:${process.env.PORT || 8080}/js/`,
    path: process.cwd() + "/public/js",
    filename: 'bundle.js'
  }
}
