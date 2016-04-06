var express = require("express");
var router = express.Router();
var und = require('underscore');
var jsonParser = require('body-parser').json();

function getList(name) {
  var list = und.find(req.user.lists, function(i) {
    return i.name.toLowerCase() == name.toLowerCase();
  });
  return list;
}

router.get('/:id', function(req, res) {
  var list = getList(req.params.id)
  if (!list) {
    res.status(404).send('No list by name: ' + req.params.id);
  }
  res.json(list);
});

router.post('/:id', jsonParser, function(req, res) {
  var list = getList(req.user.lists);
  var id = req.params.id.toLowerCase();
  res.json(list)
});

router.put('/:id', function(req, res) {

  res.json()
});

router.delete('/:id', function(req, res) {
  var list = getList(req.user.lists);
});

module.exports = router;
