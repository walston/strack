var express = require("express");
var router = express.Router();

router.get('/:user', function(req, res) {
  res.send('user logged in as ' + req.params.user);
});

router.get('/:user/:watchlist', function(req, res) {
  var user = req.params.user;
  var list = req.params.watchlist;
  res.send('User: ' + user + ', list: ' + list)
});

module.exports = router;
