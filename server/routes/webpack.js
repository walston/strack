var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var express = require('express');
var router = express.Router();

var config = require(process.env.CLIENT_FOLDER + "/webpack.config.js")
var compiler = webpack(config)
var middleware = webpackDevMiddleware(compiler, {
  path: "/",
  publicPath: config.publicPath,
})

compiler.watch({
  aggregateTimeout: 1000
}, (err, stats) => {
  console.log(err || stats);
})

router.get('/bundle.js', middleware, function(req, res) {
  try {
    res.sendFile(config.output.path + "/bundle.js");
  }
  catch (e) {
    console.log(e);
    res.status(404).json(e);
  }
});

module.exports = router;
