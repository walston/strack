var getData = new Promise(function(resolve, reject) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/all');
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
  Promise.all(data.map(symbolPromises))
  .then(function(values) {
    console.log(values);
  });
});

// this acts on 500+ symbols
// perhaps a bulk transaction
// is necessary
function symbolPromises(symbol) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/' + symbol);
    xhr.addEventListener('error', function(message) {
      reject(message)
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
  });
};
