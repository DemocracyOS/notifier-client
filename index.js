/**
 * Module dependencies.
 */

var object = require('object');

/**
 * Expose `CSV` constructor.
 */

module.exports = NotifierClient;

var defaults = {
  host: 'localhost',
  port: '80',
  path: '/api',
  token: null
}

/**
 * Creates a Client instance. Takes an object with options.
 *
 * @param {Object} options for configuring the client instance.
 *     - host {String} defaults to `localhost`.
 *     - port {String} defaults to '80'.
 *     - protocol {String} defautls to `http`.
 *     - path {String} api path - defaults to `/api`.
 *     - token {String} api token - defaults to `null`.
 * @return {NotifierClient} `NotifierClient` instance
 * @api public
 */

function NotifierClient (options) {
  if (!(this instanceof CSV)) {
    return new CSV(data, options);
  }

  this.options = object.merge({}, defaults);
  this.options = object.merge(this.options, options || {});
}
