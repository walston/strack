var request = require('request');
var fs = require('fs');
var fileExists = require('file-exists');
var csv = require('csv');
csv.parse = require('csv-parse/lib/sync');
var und = require('underscore');

const DB_PATH = './db';
const YAHOO_FINANCE_URL = 'http://download.finance.yahoo.com/d/quotes.csv'; // s=:stocks & f=:DATAPOINTS
const YAHOO_HISTORICAL_URL = 'http://ichart.finance.yahoo.com/table.csv?s=AAPL&c=1962'; // s=:stock & c=:time
const DATAPOINTS = 'snabo';

function makeTicker(symbol, name, ask, bid, open) {
  return {
    symbol: symbol,
    name: name,
    ask: ask,
    bid: bid,
    open: open
  }
}

function Portfolio () {
  function build(stocks) {
    if (!Array.isArray(stocks)) { stocks = new Array(stocks) };

    if ( !fileExists(DB_PATH) || fs.statSync(DB_PATH).mtime < (Date.now() - 180000)) {
      request.get(YAHOO_FINANCE_URL +
        '?s=' + stocks.join('+') +
        '&f=' + DATAPOINTS ,
        apiHandler);
    }
  }

  function apiHandler(error, response, raw) {
    if (!error && response.statusCode == 200) {
      var data = csv.parse(raw).map(function(datum) {
        return makeTicker.apply(new Object(), datum);
      });
      makeDB(data)
    }
    else {
      data = error;
    }
  }

  function makeDB(data) {

    fs.writeFile(DB_PATH, JSON.stringify(data),
      (err) => { if (err) throw err }
    );
  }

  function queryDB(stock) {
    var db = JSON.parse(fs.readFileSync('./db').toString('utf8'));
    return db.find(function(item) {
      return item.symbol.toUpperCase() == stock.toUpperCase();
    });
  }

  function current(stocks) {
    if (stocks == 'all') {
      return JSON.parse(fs.readFileSync('./db').toString('utf8'))
    }
    if (!Array.isArray(stocks)) { stocks = new Array(stocks) };
    return stocks.map(function(stock) {
      return queryDB(stock);
    })
  }

  function search(query) {
    var db = JSON.parse(fs.readFileSync(DB_PATH).toString('utf8'))
    return und.filter(db, function(stock) {
      return und.find(query, function(symbol) {
        console.log(symbol + ' == ' + stock.symbol);
        return (new RegExp(symbol, 'gi')).test(stock.symbol);
      })
    });
  }

  this.build = build;
  this.current = current;
  this.search = search;
}
var yahoo = new Portfolio();
module.exports = yahoo;
