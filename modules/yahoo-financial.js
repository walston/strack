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
      return 2;
    }
    else if (up200) {
      return 1
    }
    else if (up50) {
      return (-1);
    }
    else {
      return (-2);
    }
  }

  return {
    symbol: symbol,
    name: name,
    ask: ask,
    bid: bid,
    open: open,
    "ticker-trend": ticker_trend,
    "earnings-per-share": eps,
    "pe-ratio": pe,
    "50-day-MA": m3,
    "200-day-MA": m4,
    "ma-quality": maCalculator(open, m3, m4)
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
