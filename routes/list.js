var express = require("express");
var router = express.Router();
var und = require('underscore');
var jsonParser = require('body-parser').json();
var yahoo = require('../modules/yahoo-financial');

function getList(user, name) {
  var list = und.find(user.lists, function(i) {
    return i.name.toLowerCase() == name.toLowerCase();
  });
  return list;
}

function fulfill(list) {
  var symbols = und.map(list.stocks, function(i) {
    return i.symbol;
  });
  var stocks = yahoo.current(symbols);
  list.stocks = und.map(list.stocks, function(listItem) {
    var matching = und.find(stocks, function(ticker) {
      return ticker.symbol == listItem.symbol;
    });
    return und.extend(matching, listItem);
  });
  return list;
}

router.get('/:id', function(req, res) {
  var list = getList(req.user, req.params.id)
  if (list) {
    res.json(fulfill(list));
  }
  else {
    res.status(404).send('No list by name: ' + req.params.id);
  }
});

router.post('/:id', jsonParser, function(req, res) {
  var id = req.params.id.toLowerCase();
  if (getList(req.user, id) == undefined) {
    var list = {
      name: id,
      stocks: req.body
    }
    req.user.lists.push(list);
    res.json(fulfill(list));
  }
  else {
    res.status(409).send('List "' + id + '" exists already');
  }
});

router.put('/:id', jsonParser, function(req, res) {
  var list = getList(req.user, req.params.id);
  if (list) {
    list.stocks = und.union(list.stocks, req.body);
    res.json(fulfill(list));
  }
  else {
    res.status(404).send('No list by name: ' + req.params.id);
  }
});

router.delete('/:id', function(req, res) {
  var list = getList(req.user, req.params.id);
  if (list) {
    req.user.lists = und.reject(req.user.lists, function(i) {
      return i.name == req.params.id.toLowerCase();
    });
    res.status(200).send('List "' + req.params.id + '" removed.');
  }
  else {
    res.status(404).send('Nothing to delete');
  }

});

module.exports = router;
