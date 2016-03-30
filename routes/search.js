var express = require("express");
var router = express.Router();
var yahoo = require('../modules/yahoo-financial');

router.get('/', function(req, res) {
  var query = req.query.s.split(',');
  console.log(query);
  res.json(yahoo.current(query));
});

module.exports = router;
