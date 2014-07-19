/**
 * @license GPL-3.0
 * @author 0@39.yt (Yurij Mikhalevich)
 */
var path = require('path');
var scriptServer = require('script-server');


/**
 * @type {Validator|exports}
 */
exports.validator = require('./rerevalidator');


/**
 * @param {string} pathToFiltersJs
 * @param {Object} srv
 */
exports.serve = function(pathToFiltersJs, srv) {
  scriptServer.serve('/rerevalidator/minified.js', [
    path.join(__dirname, '/node_modules/revalidator/lib/revalidator.js'),
    path.join(__dirname, '/rerevalidator.js'),
    pathToFiltersJs
  ], srv);
};
