var express = require('express'); var app = express();
var request = require('request');
var bodyParser = require('body-parser'); var jsonParser = bodyParser.json();
var yahoo = require('yahoo-finance');
var data = require('./database.js');

function dateFormat(d) {
  return [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate()
  ].join('-');
}

app.use(function(req, res, next) { console.log(req.url); next();});
app.use(express.static('./public/'));

app.get('/api/all', function(req, res) {
  res.json(data);
});

app.get('/api/:symbol/', function(req, res) {
  var x = yahoo.historical({
    symbol: req.params.symbol,
    // from 1 week ago ... in milliseconds
    from: dateFormat(new Date(Date.now() - 604800000)),
    to: dateFormat(new Date()),
    period: 'd'
  }, function(err, quotes) {
    if (!err) {
      res.json(quotes);
    }
    else {
      res.status(500).send(err);
    }
  });
});

app.listen(8080, function(req, res, next) {
  console.log('Listening on: 8080...');
});
