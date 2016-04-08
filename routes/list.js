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

router.post('/rename', jsonParser, function(req, res) {
  var oldName = req.body.old;
  var newName = req.body.new;
  var list = getList(req.user, oldName);
  if (getList(req.user, oldName) && !getList(req.user, newName)) {
    list.name = newName;
    res.status(200).json({
      heading: {
        pointer: 'lists',
        source: list.name,
        text: list.name
      },
      stocks: fulfill(list).stocks
    });
  }
  else {
    res.status(409).json({
      heading: {
        pointer: 'lists',
        source: list.name,
        text: list.name
      },
      stocks: fulfill(list).stocks
    });
  }
});

router.get('/create', function(req, res) {
  var name = 'default';
  if (!!getList(req.user, name)) {
    var i;
    while (!!getList(req.user, name + i)) {
      i++
    }
    name += i;
  }
  req.user.lists.push({
    name: name,
    stocks: []
  });
  var list = getList(req.user, name);
  res.status(200).json({
    heading: {
      pointer: 'lists',
      source: list.name,
      text: list.name
    },
    stocks: fulfill(list).stocks
  });
});

router.get('/:id', function(req, res) {
  var list = getList(req.user, req.params.id)
  if (list) {
    res.json({
      heading: {
        pointer: 'lists',
        source: list.name,
        text: list.name
      },
      stocks: fulfill(list).stocks
    });
  }
  else {
    res.status(404).send('No list by name: ' + req.params.id);
  }
});

router.put('/:id', jsonParser, function(req, res) {
  var list = getList(req.user, req.params.id);
  if (list) {
    list.stocks = und.union(list.stocks, req.body);
    res.json({
      notice: {
        status: 'success',
        text: 'Added ' + req.body[0].symbol + ' to ' + req.params.id
      }
    });
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
