/**
 * Module dependencies.
 */

var object = require('object-component');
var request = require('superagent');
var url = require('url');
var log = require('debug')('notifier-client');

/**
 * Expose `NotifierClient` constructor.
 */

module.exports = NotifierClient;

var defaults = {
  protocol: 'http',
  path: '/api/events',
  port: 80,
};

/**
 * Creates a Client instance. Takes an object with options.
 * If required options aren't specified, notifier-client considers
 * no server is available and will not send any request.
 *
 * @param {Object} options for configuring the client instance.
 *     - host {String} host name for the notifier server - REQUIRED.
 *     - port {String} port for the notifier server - defaults to '80'.
 *     - protocol {String} http or https? - defaults to `http`.
 *     - path {String} notifier server events api path - defaults to `/api/events`.
 *     - token {String} api token - REQUIRED.
 * @return {NotifierClient} `NotifierClient` instance
 * @api public
 */

function NotifierClient (options) {
  if (!(this instanceof NotifierClient)) {
    return new NotifierClient(options);
  }

  this.options = object.merge({}, defaults);
  this.options = object.merge(this.options, options || {});

  if (!this.enabled()) log('not enough options - notifications disabled')
}

Noti.prototype.enabled = function() {
  return this.protocol && this.host && this.path && this.port && this.token;
};

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

  if (typeof event === 'object') {
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

  if (typeof data === 'object') {
    this.event = object.merge(this.event, data);
  } else {
    event[data] = data;
  }

  return this;
};

/**
* Sends notification request
*
* @param {Function} optional callback
* @api public
*/

NotifierClient.prototype.send = function(callback) {

  if (this.enabled()) {
    callback = callback || function () {};

    request
      .post(this._buildUrl(this.options))
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
  } else {
    log('unable to send notification request - notifier disabled');
  }
};

/**
* Builds request URL
*
* @api private
*/

NotifierClient.prototype._buildUrl = function(opts) {
  return url.format({
    protocol: opts.protocol,
    hostname: opts.host,
    port: opts.port,
    pathname: opts.path,
    search: '?access_token=' + opts.token
  });
};
