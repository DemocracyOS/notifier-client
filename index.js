/**
 * Module dependencies.
 */

var object = require('object-component');
var request = require('superagent');
var log = require('debug')('notifier-client');

/**
 * Expose `NotifierClient` constructor.
 */

module.exports = NotifierClient;

var defaults = {
  host: 'localhost',
  path: '/api/events',
  port: 80,
  protocol: 'http',
  token: null
};

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
  if (!(this instanceof NotifierClient)) {
    return new NotifierClient(options);
  }

  this.options = object.merge({}, defaults);
  this.options = object.merge(this.options, options || {});
}


/**
* Sends notification
*
* @param {Object} or {String} either event with data or just event name
* @param {Function} optional callback
* @return {NotifierClient} `NotifierClient` instance
* @api public
*/
NotifierClient.prototype.notify = function(event, callback) {
  this.event = {};

  if(typeof event === 'object') {
    this.event = event;
    this.send(callback);
  } else {
    this.event.event = event;
  }

  return this;
};

/**
* Initialize user field of event
*
* @param {String} recepient/user id
* @return {NotifierClient} `NotifierClient` instance
* @api public
*/
NotifierClient.prototype.to = function(recipient) {
  this.event.user = recipient;
  return this;
};

/**
* Initialize data field of event
*
* @param {Object} event data
* @return {NotifierClient} `NotifierClient` instance
* @api public
*/
NotifierClient.prototype.withData = function(data) {
  this.event.data = data;
  return this;
};

/**
* Sends notification request
*
* @param {Function} optional callback
* @api public
*/
NotifierClient.prototype.send = function(callback) {
  callback = callback || function () {};

  request
    .post(this._buildUrl())
    .set('Accept', 'application/json')
    .send(this.event)
    .end(function (err, res) {
      if (err) {
        log('Unexpected error when sending event %j', this.event);
        return callback(err);
      }

      if (res.body.error || res.statusCode > 201) {
        log('Error for event %j: %s', this.event, res.body.error);
        return callback(res.body);
      }

      callback(null, res.body);
    });
};

/**
* Builds request URL
*
* @api private
*/
NotifierClient.prototype._buildUrl = function() {
  return this.options.protocol + '://' + this.options.host + ':' + this.options.port + this.options.path + '?access_token=' + this.options.token;
};
