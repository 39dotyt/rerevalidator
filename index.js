/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */

var path = require('path'),
    uglifyjs = require('uglify-js');


/**
 * @type {Validator|exports}
 */
exports.validator = require('./rerevalidator');


/**
 * @param {string} pathToFiltersJs
 * @param {Object} srv
 */
exports.serve = function(pathToFiltersJs, srv) {
  var url = '/rerevalidator/minified.js',
      evs = srv.listeners('request').slice(0);
  srv.removeAllListeners('request');
  srv.on('request', function(req, res) {
    if (0 === req.url.indexOf(url)) {
      var result = uglifyjs.minify([
        path.join(__dirname, '/node_modules/revalidator/lib/revalidator.js'),
        path.join(__dirname, '/rerevalidator.js'),
        pathToFiltersJs
      ]);
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.write(result.code);
      res.end();
    } else {
      for (var i = 0; i < evs.length; i++) {
        evs[i].call(srv, req, res);
      }
    }
  });
};
