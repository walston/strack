var express = require('express'); var app = express();
var request = require('request');
var bodyParser = require('body-parser'); var jsonParser = bodyParser.json();
var data = require('./modules/database.js');
var yahoo = require('./modules/yahoo-financial');
yahoo.build(data);

app.use(function(req, res, next) { console.log(req.method + ' : ' + req.url); next();});

app.post('/data/bulk', jsonParser, function(req, res) {
  var array = yahoo.current(req.body.symbols)
  res.json(array);
});

app.get('/data/:symbol/', function(req, res) {
  var object = yahoo.current(req.params.symbol)
  res.send(object);
});
app.use(express.static('./public/'));

app.listen(8080, function(req, res, next) {
  console.log('Listening on: 8080...');
});
