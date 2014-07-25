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
  if (!(this instanceof NotifierClient)) {
    return new NotifierClient(options);
  }

  this.options = object.merge({}, defaults);
  this.options = object.merge(this.options, options || {});
}

NotifierClient.prototype.notify = function(event) {

  if(typeof event === 'object') {

    this.event = event;
    this.send();

  } else {
    this.event.event = event;
  }

  return this;
};

NotifierClient.prototype.to = function(recipient) {

  if(typeof recipient === 'string') {
    recipient = [ recipient ];
  }

  this.event.recipient = recipient;
  return this;
};

NotifierClient.prototype.withData = function(data) {
  this.event.data = data;
  return this;
};

NotifierClient.prototype.send = function() {
  request
  .post(this.buildUrl())
  .set('Accept', 'application/json')
  .send(this.event)
  .end(function (err, res) {
    if (err) {
      log('Unexpected error when sending event %j', this.event);
      return;
    };

    if (res.body.error) {
      log('Error for event %j: %s', this.event, res.body.error);
      return;
    }

    // Great success!

  });
};

NotifierClient.prototype.buildUrl = function() {
  return this.options.protocol + this.options.host + ':' + this.options.port + this.options.path;
};
