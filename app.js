var express = require('express'); var app = express();
var request = require('request');
var bodyParser = require('body-parser'); var jsonParser = bodyParser.json();
// var yahoo = require('yahoo-finance');
var data = require('./database.js');
var yahoo = require('./yahoo-financial');
yahoo.build(data)

function dateFormat(d) {
  return [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate()
  ].join('-');
}

app.use(function(req, res, next) { console.log(req.method + ' : ' + req.url); next();});
app.use(express.static('./public/'));

app.get('/data/bulk', function(req, res) {
  res.json(data);
});

app.get('/data/:symbol/', function(req, res) {
  var x = yahoo.current(req.params.symbol)
  res.send(x);
});

app.listen(8080, function(req, res, next) {
  console.log('Listening on: 8080...');
});
