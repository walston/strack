var db = require('./userdb.js');
var und = require('underscore');

module.exports = function (req, res, next) {
  req.user = und.find(db, function(i) {
    return i.username == 'treezrppl2';
  });
  debugger;
  next();
}
