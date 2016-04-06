var feed = document.getElementById('feed');
var header = document.getElementById('header');
var sourceData;
var lastData;

function dropdown(dataMethod) {
  function watchlists (parent) {
    _.each(userData.lists, function(list) {
      var wrap = document.createElement('li');
      var link = document.createElement('a');
      link.setAttribute('data-method', dataMethod);
      link.setAttribute('data-list', list.name);
      link.textContent = list.name;
      wrap.appendChild(link);
      parent.appendChild(wrap);
    });
  }
  var container = document.createElement('ul');
  container.classList.add('dropdown-menu');
  if (userData.lists.length > 0) {
    watchlists(container);
  }
  return container;
}

function makeUserControls(container) {
  var controller = document.createElement('a');
  var username = document.createTextNode(userData.username + ' ');
  var carat = document.createElement('i');
  var dropdownMenu = dropdown('view');

  container.classList.add('dropdown');
  controller.classList.add('dropdown-toggle');
  carat.classList.add('fa', 'fa-caret-down');
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
  var dropdownContainer = document.createElement('span');
  var trigger = document.createElement('a');
  var icon = document.createElement('i');
  var dropdownMenu = dropdown('add');
  var sym = document.createElement('span');
  var name = document.createElement('p');
  var open = document.createElement('span');

  container.setAttribute('data-symbol', ticker.symbol);
  container.classList.add('col-sm-3', 'col-xs-4', 'ticker');
  panel.classList.add('panel', 'panel-default');
  panelHead.classList.add('panel-heading', ticker.maCalculation);
  dropdownContainer.classList.add('dropdown', 'pull-right');
  trigger.classList.add('dropdown-toggle', 'btn-sm', 'btn-default');
  icon.classList.add('fa', 'fa-caret-down');
  panelBody.classList.add('panel-body');
  sym.classList.add('h4');
  open.classList.add('h6');

  trigger.setAttribute('data-toggle', 'dropdown');
  sym.textContent = ticker.symbol;
  name.textContent = ticker.name;
  open.textContent = 'open: $' + Number(ticker.open).toFixed(2);

  panelHead.appendChild(sym);
  trigger.appendChild(icon);
  dropdownContainer.appendChild(trigger);
  dropdownContainer.appendChild(dropdownMenu);
  panelHead.appendChild(dropdownContainer);
  panelBody.appendChild(name);
  panelBody.appendChild(open);
  panel.appendChild(panelHead);
  panel.appendChild(panelBody);
  container.appendChild(panel);

  return container;
}

function listState(data) {
  var heading = data.name;
  updateHeader(heading);
  var stocks = data.stocks;
  updateFeed(stocks);
}

function updateHeader(string) {
  empty(header);
  var head = document.createElement('span');
  head.classList.add('col-xs-12', 'h3');
  head.textContent = string;
  header.appendChild(head);
}

function updateFeed(data) {
  lastData = data;
  empty(feed);
  _.each(data, function(ticker) {
    feed.appendChild(makeTicker(ticker));
  });
}

function empty(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
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

document.getElementById('search').addEventListener('submit', function(e) {
  e.preventDefault();
  var query = document.getElementById('searchInput').value;
  if (!query.length) {
    empty(header)
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
  else if (method == 'add') {
    var ticker = parentWith('data-symbol', target);
    var symbol = ticker.getAttribute('data-symbol');
    var list = target.getAttribute('data-list');
    var ref = _.find(sourceData, function(stock) {
      return stock.symbol == symbol;
    });
    var payload = [{
      symbol: ref.symbol,
      costPerShare: ref.bid,
      fee: 7.95,
      sharesHeld: 5
    }];
    $.ajax({
      url: 'list/' + list,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: listState
    });
  }
  else if (method == 'view') {
    var list = target.getAttribute('data-list');
    $.get('list/' + list, listState);
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
