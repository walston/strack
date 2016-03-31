var express = require('express');
var router = express.Router();
var userDB = require('../modules/userdb');
var und = require('underscore');

router.get('/:user', function(req, res) {
  res.send('user logged in as ' + req.params.user);
});

router.get('/:user/:watchlist', function(req, res) {
  var user = und.find(userDB, function(i) {
    return i.username.toLowerCase() == req.params.user.toLowerCase();
  });
  if (!user) res.status(404).send('No user ' + req.params.user);

  var list = und.find(user.watchlists, function(i) {
    return i.name.toLowerCase() == req.params.watchlist.toLowerCase();
  });
  if (!list) res.status(404).send('No watchlist ' + req.params.watchlist)
  res.json(list.stocks);
});

module.exports = router;
