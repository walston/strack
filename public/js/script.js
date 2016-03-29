var feed = document.getElementById('feed');
var getData = new Promise(function(resolve, reject) {
  var payload = {
    symbols: ['aapl', 'zion', 'cnx', 'mat']
  }
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/data/bulk');
  xhr.addEventListener('error', function(message) {
    reject(message);
  });
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(payload));
  xhr.addEventListener('load', function() {
    if (xhr.status == 200) {
      resolve(JSON.parse(xhr.responseText));
    }
    else {
      reject(xhr.status);
    }
  });
})

getData.then(function(data) {
  data.forEach(function(ticker) {
    feed.appendChild(makeTicker(ticker));
  });
});

function makeTicker(ticker) {
  var container = document.createElement('div');
  var sym = document.createElement('p');
  var name = document.createElement('p');
  var ask = document.createElement('p');

  container.classList.add('col-xs-3');
  sym.classList.add('h3');
  name.classList.add('h5');
  ask.classList.add('h6');

  sym.textContent = ticker.symbol;
  name.textContent = ticker.name;
  ask.textContent = ticker.ask;

  container.appendChild(sym);
  container.appendChild(name);
  container.appendChild(ask);

  return container;
}
