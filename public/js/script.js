var feed = document.getElementById('feed');

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
  while(feed.firstChild) {
    feed.removeChild(feed.firstChild);
  };
  data.forEach(function(ticker) {
    feed.appendChild(makeTicker(ticker));
  });
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

$.get({
  url: 'fetch/all',
  success: updateFeed,
  dataType: 'json'
});
