var request = require('request');
var fs = require('fs');
var csv = require('csv');
csv.parse = require('csv-parse/lib/sync');

const maxSymbolsPerCall = 200;
const yahooFinanceURL = 'http://download.finance.yahoo.com/d/quotes.csv'; // s=:stocks & f=:datapoints
const yahooHistoricalURL = 'http://ichart.finance.yahoo.com/table.csv?s=AAPL&c=1962'; // s=:stock & c=:time
const datapoints = 'snab';

function makeTicker(symbol, name, ask, bid) {
  return {
    symbol: symbol,
    name: name,
    ask: ask,
    bid: bid
  }
}

function Portfolio () {
  function queryDB(stock) {
    var db = JSON.parse(fs.readFileSync('./db').toString('utf8'));
    return db.find(function(item) {
      return item.symbol.toUpperCase() == stock.toUpperCase();
    });
  }

  function build(stocks) {
    if (!Array.isArray(stocks)) { stocks = new Array(s) };
    // API calls to Yahoo! finance of more than 200 will error
    if (stocks.length > 200) {/* split stocks up */}

    var qs = '?s=' + stocks + '&f=' + datapoints;
    if (fs.statSync('./db').mtime < (Date.now() - 180000)) {
      request.get({
        uri: yahooFinanceURL + qs
      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var jsonDatabase = csv.parse(body).map(function(datum) {
            return makeTicker.apply(new Object(), datum);
          });
          fs.writeFile('./db', JSON.stringify(jsonDatabase), function(err) {
            if (err) throw err;
          });
        }
        else {
          data = error;
        }
      });
    }
  }

  function current(stocks) {
    if (!Array.isArray(stocks)) { stocks = new Array(stocks) };
    return stocks.map(function(stock) {
      return queryDB(stock);
    })
  }
  this.build = build;
  this.current = current;
}
var yahoo = new Portfolio();
module.exports = yahoo;
