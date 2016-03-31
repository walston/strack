var feed = document.getElementById('feed');
var lastData;

function makeTicker(ticker) {
  var container = document.createElement('div');
  var panel = document.createElement('div');
  var panelHead = document.createElement('div');
  var panelBody = document.createElement('div');
  var sym = document.createElement('span');
  var name = document.createElement('p');
  var ask = document.createElement('span');

  container.classList.add('col-sm-3', 'col-xs-4', 'ticker');
  panel.classList.add('panel', 'panel-default');
  panelHead.classList.add('panel-heading');
  panelBody.classList.add('panel-body');
  sym.classList.add('h3');
  name.classList.add('h5');
  ask.classList.add('h6');

  sym.textContent = ticker.symbol;
  name.textContent = ticker.name;
  ask.textContent = 'ask: ' + ticker.ask;

  panelHead.appendChild(sym);
  panelBody.appendChild(name);
  panelBody.appendChild(ask);
  panel.appendChild(panelHead);
  panel.appendChild(panelBody);
  container.appendChild(panel);

  return container;
}

function updateFeed(data) {
  lastData = data;
  while(feed.firstChild) {
    feed.removeChild(feed.firstChild);
  }
  data.forEach(function(ticker) {
    feed.appendChild(makeTicker(ticker));
  });
}

function sortData(param, data, descending) {
  param = param.toLowerCase();
  data = _.sortBy(data, function(ticker) {
    if (!ticker[param]) return null;
    if (!isNaN(ticker[param])) {
      return Number.parseInt(ticker[param]);
    }
    else if (typeof ticker[param] == 'string') {
      return ticker[param].toLowerCase();
    }
    else {
      return null;
    }
  });
  if (descending === true) data.reverse();
  updateFeed(data);
}

function watchlistAdd(symbol, watchlist) {
  symbol = symbol.toUpperCase();
  $.ajax({
    url: 'user/' + userData.username + '/' + watchlist,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ stock: symbol }),
    success: function() {
      var list = _.find(userData.watchlists, function(i) {
        return watchlist == i.name;
      });
      list.stocks.push(symbol);
    }
  })
}

document.getElementById('search').addEventListener('submit', function(e) {
  e.preventDefault();
  var query = document.getElementById('searchInput').value;
  $.get({
    url: 'search?s=' + query,
    success: updateFeed,
    dataType: 'json'
  });
});

document.addEventListener('click', function(event) {
  function parentWith(attribute, clicked) {
    for (var looker = clicked;
      looker != document.body;
      looker = looker.parentNode) {
        if (looker.hasAttribute(attribute)) {
          return looker
        }
    }
    return clicked;
  }

  var target = parentWith('data-method', event.target);
  var method = target.getAttribute('data-method');

  if (method == 'sort') {
    var att = 'data-sort';
    var sortSystem = parentWith(att, event.target).getAttribute(att);
    sortData(sortSystem, lastData);
  }
  if (method == 'watchlistAdd') {
    watchlistAdd('STFU', 'test', 'treezrppl2')
  }
});

var userData;
$.get({
  url: 'user/treezrppl2',
  dataType: 'json',
  success: function(payload) {
    userData = payload;
  }
});

$.get({
  url: 'fetch/all',
  success: updateFeed,
  dataType: 'json'
});
