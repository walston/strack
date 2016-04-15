var request = require('request');
var fs = require('fs');
var fileExists = require('file-exists');
var csv = require('csv');
csv.parse = require('csv-parse/lib/sync');
var und = require('underscore');

const DB_PATH = './db';
const YAHOO_FINANCE_URL = 'http://download.finance.yahoo.com/d/quotes.csv'; // s=:stocks & f=:DATAPOINTS
const YAHOO_HISTORICAL_URL = 'http://ichart.finance.yahoo.com/table.csv?s=AAPL&c=1962'; // s=:stock & c=:time
const DATAPOINTS = 'snabot7erm3m4';

function makeTicker(symbol, name, ask, bid, open, ticker_trend, eps, pe, m3, m4) {
  function maCalculator (current, ma50, ma200) {
    var up200 = ma200 - current > 0;
    var up50 = ma50 - current > 0;
    if (up200 && up50) {
      return 'great';
    }
    else if (up200) {
      return 'good'
    }
    else if (up50) {
      return 'ok';
    }
    else {
      return 'junk';
    }
  }

  function numberize(string) {
    return Number(string) || string;
  }

  return {
    symbol: symbol,
    name: name,
    ask: numberize(ask),
    bid: numberize(bid),
    open: numberize(open),
    trend: ticker_trend,
    eps: numberize(eps),
    pe: numberize(pe),
    ma50: numberize(m3),
    ma200: numberize(m4),
    maCalculation: maCalculator(open, m3, m4)
  }
}

function Portfolio () {
  var db
  function build(stocks) {
    if (!Array.isArray(stocks)) { stocks = new Array(stocks) };
    if ( !fileExists(DB_PATH) || fs.statSync(DB_PATH).mtime < (Date.now() - 180000)) {
      debugger;
      request.get(YAHOO_FINANCE_URL +
        '?s=' + stocks.map(function(stock) {
          return stock['Symbol'];
        }).join('+') +
        '&f=' + DATAPOINTS ,
        apiHandler);
    }
  }

  function apiHandler(error, response, raw) {
    if (!error && response.statusCode == 200) {
      var data = csv.parse(raw).map(function(datum) {
        return makeTicker.apply(new Object(), datum);
      });
      db = data;
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
    if (!db) db = JSON.parse(fs.readFileSync('./db').toString('utf8'));
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
    if (!db) db = JSON.parse(fs.readFileSync(DB_PATH).toString('utf8'))
    return und.filter(db, function(stock) {
      return und.find(query, function(symbol) {
        var sym = (new RegExp(symbol, 'gi'));
        return sym.test(stock.symbol) || sym.test(stock.name);
      })
    });
  }

  this.build = build;
  this.current = current;
  this.search = search;
}
var yahoo = new Portfolio();
module.exports = yahoo;
