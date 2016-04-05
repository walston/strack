var express = require('express');
var router = express.Router();
var jsonParser = require('body-parser').json();
var userDB = require('../modules/userdb');
var und = require('underscore');

router.get('/:user', function(req, res) {
  var user = und.find(userDB, function(i) {
    return i.username.toLowerCase() == req.params.user.toLowerCase();
  });
  res.json(user);
});

router.post('/:user/watchlist/:watchlist', jsonParser, function(req, res) {
  var additive = req.body.stock.toUpperCase();
  var user = und.find(userDB, function(i) {
    return i.username.toLowerCase() == req.params.user.toLowerCase();
  });
  if (!user) res.status(404).send('No user ' + req.params.user);

  var list = und.find(user.watchlists, function(i) {
    return i.name.toLowerCase() == req.params.watchlist.toLowerCase();
  });
  if (!list) res.status(404).send('No watchlist ' + req.params.watchlist)
  if (!und.contains(list.stocks, additive)) {
    list.stocks.push(additive);
  }
  res.json(list.stocks);
});

router.post('/:user/purchaselist/:purchaselist', jsonParser, function(req, res) {
  var additive = req.body;
  var user = und.find(userDB, function(i) {
    return i.username.toLowerCase() == req.params.user.toLowerCase();
  });
  if (!user) res.status(404).send('No user ' + req.params.user);

  var list = und.find(user.purchaselists, function(i) {
    return i.name.toLowerCase() == req.params.purchaselist.toLowerCase();
  });
  if (!list) res.status(404).send('No purchaselist ' + req.params.purchaselist)
  if (!und.find(list.stocks, function(stock) {
    debugger;
    return stock.symbol == additive.symbol;
  })) {
    list.stocks.push(additive);
  }
  res.json(list.stocks);
});

module.exports = router;
