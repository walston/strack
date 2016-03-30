var express = require("express");
var router = express.Router();
var yahoo = require('../modules/yahoo-financial');

router.get('/', function(req, res) {
  var query = req.query.s.split(',');
  res.json(yahoo.search(query));
});

module.exports = router;
