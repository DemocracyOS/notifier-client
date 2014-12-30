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
  url: 'http://localhost:9001/api/events',
  token: null
};

/**
 * Creates a Client instance. Takes an object with options.
 * If required options aren't specified, notifier-client considers
 * no server is available and will not send any request.
 *
 * @param {Object} options for configuring the client instance.
 *   - url {String} full URL to the notifier events endpoint. Defaults to `http://localhost:9001/api/events`
 *   - token {String} `notifier` api token - REQUIRED.
 * @return {NotifierClient} `NotifierClient` instance
 * @api public
 */

function NotifierClient (options) {
  if (!(this instanceof NotifierClient)) {
    return new NotifierClient(options);
  }

  var opts = object.merge({}, defaults);
  opts = object.merge(opts, options || {});

  this.config = { url: url.parse(opts.url), token: opts.token };

  if (!this.enabled()) {
    log('Notifications disabled - Error with notifier-client options');
  } else {
    log('Notifications configured with options: %j and URL: %s', this.config, this._buildUrl());
  }
}

/**
 * Checks if the `notifier-client` is all set-up and enabled for use.
 * @return {Boolean} whether the `notifier` should be considered enabled
 */
NotifierClient.prototype.enabled = function() {
  return this._isValidConfig();
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

  if ('object' === typeof event) {
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
      .post(this._buildUrl(this.config))
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

NotifierClient.prototype._buildUrl = function () {
  return url.format({
    protocol: this.config.url.protocol,
    hostname: this.config.url.hostname,
    port: this.config.url.port,
    pathname: this.config.url.path,
    search: '?access_token=' + this.config.token
  });
};

/**
 * Asserts the current configuration
 * @return {Boolean} whether the configuration is valid.
 */
NotifierClient.prototype._isValidConfig = function() {
  var o = this.config;
  return !!(o.url.protocol && o.url.host && o.url.path && o.url.port && o.token);
};
