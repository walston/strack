var express = require("express");
var router = express.Router();
var bodyParser = require('body-parser'); var jsonParser = bodyParser.json();
var data = require('../modules/database.js');
var yahoo = require('../modules/yahoo-financial');
yahoo.build(data);

router.post('/', jsonParser, function(req, res) {
  var array = yahoo.current(req.body.symbols)
  res.json(array);
});

router.get('/', jsonParser, function(req, res) {
  var array = yahoo.current(req.body.symbols);
  res.json(yahoo.current(array));
})

router.get('/all', function(req, res) {
  res.json(yahoo.current('all'))
})

router.get('/:symbol/', function(req, res) {
  var object = yahoo.current(req.params.symbol)
  res.send(object);
});

module.exports = router;
