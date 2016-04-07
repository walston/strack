var feed = document.getElementById('feed');
var header = document.getElementById('header');
var sourceData;
var lastData;

function empty(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  return element;
}

function notifier(notice) {
  var wrap = empty(document.getElementById('alerter'));
  if (!notice) {
    wrap.classList.add('hidden');
    return null;
  }
  else {
    wrap.classList.remove('hidden');
  }
  var head = document.createElement('p');
  var note = document.createElement('p');

  wrap.classList.add('alert-' + notice.status);
  head.classList.add('h5');

  head.textContent = notice.heading;
  note.textContent = notice.text;

  wrap.appendChild(head);
  wrap.appendChild(note);
}

function updateHeader(string) {
  var head = empty(document.createElement('span'));
  if (!string) {
    head.classList.add('hidden');
    return null;
  }
  else {
    head.classList.remove('hidden');
  }
  head.classList.add('col-xs-12', 'h3');
  head.textContent = string;
  header.appendChild(head);
}

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
  var open = document.createElement('p');
  var value = document.createElement('p');

  container.setAttribute('data-symbol', ticker.symbol);
  container.classList.add('col-sm-3', 'col-xs-4', 'ticker');
  panel.classList.add('panel', 'panel-default');
  panelHead.classList.add('panel-heading', ticker.maCalculation);
  dropdownContainer.classList.add('dropdown', 'pull-right');
  trigger.classList.add('dropdown-toggle', 'btn-sm', 'btn-default');
  icon.classList.add('fa', 'fa-caret-down');
  panelBody.classList.add('panel-body');
  sym.classList.add('h4');
  name.classList.add('truncate');
  open.classList.add('h6');
  value.classList.add('h6');

  trigger.setAttribute('data-toggle', 'dropdown');
  sym.textContent = ticker.symbol;
  name.textContent = ticker.name;
  open.textContent = 'open: $' + Number(ticker.open).toFixed(2);
  value.textContent = (function(x) {
    if (x.sharesHeld){
      var c = (x.costPerShare * x.sharesHeld);
      var y = (x.bid * x.sharesHeld);
      return 'ROI: ' + (((y - c ) / c) * 100).toFixed(3) + '%';
    }
    else {
      return null
    }
  })(ticker)

  panelHead.appendChild(sym);
  trigger.appendChild(icon);
  dropdownContainer.appendChild(trigger);
  dropdownContainer.appendChild(dropdownMenu);
  panelHead.appendChild(dropdownContainer);
  panelBody.appendChild(name);
  panelBody.appendChild(open);
  panelBody.appendChild(value);
  panel.appendChild(panelHead);
  panel.appendChild(panelBody);
  container.appendChild(panel);

  return container;
}

function updateFeed(data) {
  lastData = data;
  empty(feed);
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

function pageManager(data) {
  notifier(data.notice)
  updateHeader(data.name);
  var stocks = data.stocks;
  updateFeed(stocks);
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
      success: pageManager
    });
  }
  else if (method == 'view') {
    var list = target.getAttribute('data-list');
    $.get('list/' + list, pageManager);
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
