var feed = document.getElementById('feed');
var sourceData;
var lastData;

function makeUserControls(container) {
  function dropdown () {
    var container = document.createElement('ul');
    var hasWatchlists = userData.watchlists.length > 0;
    var hasPurchaselists = userData.purchaselists.length > 0;

    if (hasWatchlists) {
      header(container, 'Watchlists');
      lists(container, userData.watchlists, 'watchlist');
    }
    if (hasPurchaselists) {
      header(container, 'Purchase Lists');
      lists(container, userData.purchaselists, 'purchaselist');
    }
    return container;
  }

  function lists (menu, list, method) {
    _.each(list, function(list, i) {
      var wrap = document.createElement('li');
      var link = document.createElement('a');
      link.setAttribute('data-method', method);
      link.setAttribute('data-list', i);
      link.textContent = list.name;
      wrap.appendChild(link);
      menu.appendChild(wrap);
    });
  }

  function header(menu, string) {
    var sep = document.createElement('li');
    sep.classList.add('dropdown-header');
    sep.textContent = string;
    menu.appendChild(sep);
  }

  var controller = document.createElement('a');
  var username = document.createTextNode(userData.username + ' ');
  var carat = document.createElement('i');
  var dropdownMenu = dropdown();

  container.classList.add('dropdown');
  controller.classList.add('dropdown-toggle');
  carat.classList.add('fa', 'fa-caret-down');
  dropdownMenu.classList.add('dropdown-menu');
  controller.setAttribute('data-toggle', 'dropdown');

  container.appendChild(controller);
  controller.appendChild(username);
  controller.appendChild(carat);
  container.appendChild(dropdownMenu);
}

function makeTicker(ticker) {
  var container = document.createElement('div');
  var panel = document.createElement('div');
  var panelHead = document.createElement('div');
  var panelBody = document.createElement('div');
  var addButton = contextualDropdown();
  var sym = document.createElement('span');
  var name = document.createElement('p');
  var open = document.createElement('span');

  container.setAttribute('data-symbol', ticker.symbol);
  container.classList.add('col-sm-3', 'col-xs-4', 'ticker');
  panel.classList.add('panel', 'panel-default');
  panelHead.classList.add('panel-heading', ticker.maCalculation);
  panelBody.classList.add('panel-body');
  sym.classList.add('h4');
  open.classList.add('h6');

  sym.textContent = ticker.symbol;
  name.textContent = ticker.name;
  open.textContent = 'open: $' + Number(ticker.open).toFixed(2);

  panelHead.appendChild(sym);
  panelHead.appendChild(addButton);
  panelBody.appendChild(name);
  panelBody.appendChild(open);
  panel.appendChild(panelHead);
  panel.appendChild(panelBody);
  container.appendChild(panel);

  return container;
}

function contextualDropdown() {
  function dropdownList(watchlists) {
    var menu = document.createElement('ul');
    menu.classList.add('dropdown-menu');
    _.each(watchlists, function(watchlist) {
      var listItem = document.createElement('li');
      var text = document.createElement('a');
      listItem.setAttribute('data-method', 'watchlistAdd');
      listItem.setAttribute('data-list', watchlist.name);
      text.textContent = watchlist.name;
      listItem.appendChild(text);
      menu.appendChild(listItem);
    });
    return menu;
  }

  var container = document.createElement('span');
  var trigger = document.createElement('a');
  var icon = document.createElement('i');
  var dropdown = dropdownList(userData.watchlists);

  container.classList.add('dropdown', 'pull-right');
  trigger.classList.add('btn-sm', 'btn-default');
  icon.classList.add('fa', 'fa-caret-down')
  trigger.setAttribute('type', 'button');
  trigger.setAttribute('data-toggle', 'dropdown');

  trigger.appendChild(icon);
  container.appendChild(trigger);
  container.appendChild(dropdown);

  return container;
}

function updateFeed(data) {
  lastData = data;
  while(feed.firstChild) {
    feed.removeChild(feed.firstChild);
  }
  _.each(data, function(ticker) {
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
    url: 'user/' + userData.username + '/watchlist/' + watchlist,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ stock: symbol }),
    success: function(payload) {
      var list = _.find(userData.watchlists, function(i) {
        return watchlist == i.name;
      });
      list.stocks = payload;
    }
  })
}

function purchaselistPrompt(symbol, purchaselist) {
  var stock = _.find(sourceData, function(value) {
    return value.symbol == symbol;
  });
  var additive = {
    symbol: stock.symbol,
    cost: Number(stock.bid),
    shares: 5,
    fee: 7.95
  };
  purchaselistAdd(additive, purchaselist);
}

function purchaselistAdd(stock, purchaselist) {
  $.ajax({
    url: 'user/' + userData.username + '/purchaselist/' + purchaselist,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(stock),
    success: function(payload) {
      var list = _.find(userData.purchaselists, function(i) {
        return purchaselist == i.name;
      });
      list.stocks = payload;
    }
  })
}

document.getElementById('search').addEventListener('submit', function(e) {
  e.preventDefault();
  var query = document.getElementById('searchInput').value;
  if (!query.length) {
    updateFeed(sourceData);
  }
  else {
    $.get({
      url: 'search?s=' + query,
      success: updateFeed,
      dataType: 'json'
    });
}
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
  else if (method == 'watchlistAdd') {
    var ticker = parentWith('data-symbol', event.target);
    var symbol = ticker.getAttribute('data-symbol');
    watchlistAdd(symbol, target.getAttribute('data-list'));
  }
  else if (method == 'purchaselistAdd') {
    var purchase = parentWith('data-symbol', event.target);
    var bought = purchase.getAttribute('data-symbol');
    purchaselistPrompt(bought, target.getAttribute('data-list'));
  }
  else if (method == 'watchlist') {
    var watched = {
      symbols: userData.watchlists[target.getAttribute('data-list')].stocks
    }
    $.ajax({
      url: 'fetch',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(watched),
      success: updateFeed
    });
  }
  else if (method == 'purchaselist') {
    var purchased = {
      symbols: []
    }
    _.each(userData.purchaselists[target.getAttribute('data-list')].stocks,
      function(stock) {
        purchased.symbols.push(stock.symbol);
      }
    );
    $.ajax({
      url: 'fetch',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(purchased),
      success: updateFeed
    });
  }

});

var userData;
$.get({
  url: 'user/treezrppl2',
  dataType: 'json',
  success: function(payload) {
    userData = payload;
    makeUserControls(document.getElementById('userControls'));
  }
});

$.get({
  url: 'fetch/all',
  success: function(payload) {
    sourceData = payload;
    updateFeed(payload);
  },
  dataType: 'json'
});
