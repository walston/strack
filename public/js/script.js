var getData = new Promise(function(resolve, reject) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/data/bulk');
  xhr.addEventListener('error', function(message) {
    reject(message);
  });
  xhr.send();
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
  data.forEach(function(symbol) {
    var p = document.createElement('p');
    p.textContent = symbol;
    document.body.appendChild(p);
  });
});
