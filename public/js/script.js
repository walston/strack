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
    wrap.className = '';
    wrap.classList.add('alert', 'alert-' + notice.status);
  }
  var head = document.createElement('p');
  var note = document.createElement('p');

  head.classList.add('h5');

  head.textContent = notice.heading;
  note.textContent = notice.text;

  wrap.appendChild(head);
  wrap.appendChild(note);
  setTimeout(function() {
    wrap.className = 'hidden'
  }, 1000)
}

function updateHeader(info) {
  var wrap = empty(document.getElementById('header'));
  if (!info) {
    wrap.classList.add('hidden');
    return null;
  }
  else {
    wrap.classList.remove('hidden');
  }
  var head = document.createElement('span');
  head.setAttribute('data-method', 'edit');
  head.setAttribute('data-pointer', info.pointer);
  head.setAttribute('data-source', info.source)
  head.classList.add('col-xs-12', 'h3');
  head.textContent = info.text;
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

function sortDropdown() {
  var sortSystems = {
    ask: 'Ask',
    bid: 'Bid',
    eps: 'Earnings/Share',
    ma50: '50-day Moving Average',
    ma200: '200-day Moving Average',
    name: 'Name',
    open: 'Today\'s Open',
    pe: 'Price/Earnings Ratio',
    symbol: 'Ticker Symbol'
  }
  var parent = empty(document.getElementById('sortButton'));
  var trigger = document.createElement('a');
  var menu = document.createElement('ul');
  _.each(_.keys(sortSystems), function(method) {
    var wrap = document.createElement('li');
    var link = document.createElement('a');
    link.setAttribute('data-method', 'sort');
    link.setAttribute('data-sort', method);
    link.setAttribute('data-desc', 'true');
    link.textContent = sortSystems[method];
    wrap.appendChild(link);
    menu.appendChild(wrap);
  });
  parent.classList.add('dropdown');
  trigger.classList.add('btn', 'btn-default', 'dropdown-toggle');
  menu.classList.add('dropdown-menu');
  trigger.setAttribute('data-toggle', 'dropdown');

  trigger.textContent = 'Sort';
  parent.appendChild(trigger);
  parent.appendChild(menu);
}

function makeUserControls(container) {
  var controller = document.createElement('a');
  var username = document.createTextNode(userData.username + ' ');
  var carat = document.createElement('i');
  var dropdownMenu = dropdown('view');
  var addWatchlist = document.createElement('li');
  var addLink = document.createElement('a');

  container.classList.add('dropdown');
  controller.classList.add('dropdown-toggle');
  carat.classList.add('fa', 'fa-caret-down');
  controller.setAttribute('data-toggle', 'dropdown');
  addLink.setAttribute('data-method', 'create');
  addLink.textContent = 'Add New...';

  addWatchlist.appendChild(addLink);
  dropdownMenu.appendChild(addWatchlist);
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
  if (!data) return null;
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

function editable(element) {
  var oldName = element.getAttribute('data-source');
  var parent = element.parentNode;
  var oldElement = element;
  var newElement = document.createElement('form');
  var group = document.createElement('div');
  var input = document.createElement('input');
  newElement.classList.add('col-xs-12');
  group.classList.add('input-group', 'input-group-lg');
  input.classList.add('form-control', 'h2', 'editable');
  input.setAttribute('value', oldElement.textContent);
  input.setAttribute('data-pointer', element.getAttribute('data-pointer'));
  input.setAttribute('data-source', element.getAttribute('data-source'));
  group.appendChild(input);
  newElement.appendChild(group);
  parent.replaceChild(newElement, oldElement);

  newElement.addEventListener('submit', function(e) {
    e.preventDefault();
    // just make a request to change the name
    // url: list/rename/ {old: xxx, new: yyy}
    $.ajax({
      type: 'POST',
      url: 'list/rename',
      contentType: 'application/json',
      data: JSON.stringify({ old: oldName, new: input.value }),
      success: pageManager
    })
  });
}

function pageManager(data) {
  notifier(data.notice);
  updateHeader(data.heading);
  updateFeed(data.stocks);
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
      url: 'list/' + target.getAttribute('data-list'),
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: pageManager
    });
  }
  else if (method == 'view') {
    $.get({
      url: 'list/' + target.getAttribute('data-list'),
      success: pageManager
    });
  }
  else if (method == 'create') {
    $.ajax({
      url: 'list/create',
      success: pageManager
    });
  }
  else if (method == 'edit') {
    editable(target);
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

sortDropdown();

$.get({
  url: 'fetch/all',
  success: function(payload) {
    sourceData = payload;
    updateFeed(payload);
  },
  dataType: 'json'
});
