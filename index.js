/**
 * Module dependencies.
 */

var object = require('object-component')
var request = require('superagent')
var url = require('url')
var log = require('debug')('notifier-client')

/**
 * Expose `NotifierClient` constructor.
 */

module.exports = NotifierClient

var defaults = {
  url: 'http://localhost:9001/api/events', // it's over 9000!
  token: ''
}

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
function NotifierClient (opts) {
  if (!(this instanceof NotifierClient)) {
    return new NotifierClient(opts)
  }

  // determine strategy for submitting a notification event
  if (_embedded(opts)) {
    this.sendStrategy = embeddedSend
    this.config = { notifier: opts.notifier }
  } else {
    var o = object.merge({}, defaults)
    o = object.merge(o, opts || {})

    this.sendStrategy = remoteSend
    this.config = { url: url.parse(o.url), token: o.token }
  }

  if (!this.enabled()) {
    log('Notifications disabled - Error with notifier-client options')
  }
}

/**
 * Whether the `NotifierClient` is all set-up and enabled for use.
 * @return {Boolean} whether notifications should be considered enabled
 * @api public
 */
NotifierClient.prototype.enabled = function enabled () {
  return _embedded(this.config) || _isValidRemoteConfig(this.config)
}

/**
* Sends a notification event, or prepares the `NotifierClient` to send
* a notification event with the paramenter name.
*
* @param {Mixed} event with data or just event name
* @param {Function} optional callback
* @return {NotifierClient} `NotifierClient` instance
* @api public
*/
NotifierClient.prototype.notify = function notify(event, callback) {
  this.event = {}

  if ('object' === typeof event) {
    this.event = event
    this.send(callback)
  } else {
    this.event.event = event
  }

  return this
}

/**
* Initialize to field of event
*
* @param {String} recipient recipient's id or email
* @return {NotifierClient} `NotifierClient` instance
* @api public
*/
NotifierClient.prototype.to = function to(recipient) {
  this.event.to = recipient
  return this
}

/**
* Initialize data field of event
*
* @param {Object} event data
* @return {NotifierClient} `NotifierClient` instance
* @api public
*/
NotifierClient.prototype.withData = function withData(data) {

  if ('object' === typeof data) {
    this.event = object.merge(this.event, data)
  } else {
    event[data] = data
  }

  return this
}

/**
* Sends notification request
*
* @param {Function} optional callback
* @api public
*/
NotifierClient.prototype.send = function send(event, callback) {
  if ('function' === typeof event) return this.send(null, event)

  // allow overriding the internal event
  var e = event || this.event

  if (this.enabled()) {
    this.sendStrategy(this.config, e, callback)
  } else {
    log('Unable to send notification request - notifier disabled')
  }
}

/**
 * Whether `notifier` is running (or should run) as an embedded service
 * instead of in a remote server
 * @return {Boolean} whether `notifier` is embedded or a remote server
 */
NotifierClient.prototype.embedded = function embedded () {
  return _embedded(this.config)
}

/**
 * Send event directly to a `notifier` instance
 */
function embeddedSend (config, event, callback) {
  config.notifier.notify(event, callback)
}


/**
 * Send event to a remote `notifier`
 */
function remoteSend (config, event, callback) {
  request
    .post(_buildUrl(config))
    .set('Accept', 'application/json')
    .send(event)
    .end(function (err, res) {
      if (err) {
        if ('ECONNREFUSED' === err.code) {
          log('Unable connect to the notifier server - Error: %j', err)
        } else {
          log('Unexpected error when sending event %j', event)
        }
        return callback(err)
      }

      if (res.body.error || res.statusCode > 201) {
        log('Error for event %j: %s', event, res.body.error)
        return callback(res.body)
      }

      callback(null, res.body)
    })
}

/**
 * Whether the parameter config implies that `notifier` is embedded or running remotely
 */
function _embedded(config) {
  return config.notifier && ('string' != typeof config.notifier)
}

/**
* Builds request URL
*/
function _buildUrl(config) {
  return _pruneDefaultPorts(url.format({
    protocol: config.url.protocol,
    hostname: config.url.hostname,
    port: config.url.port,
    pathname: config.url.path,
    search: '?access_token=' + config.token
  }))
}

/**
 * Asserts the current configuration for a remote `notifier`
 * @return {Boolean} whether the configuration is valid
 * @api private
 */
function _isValidRemoteConfig(config) {
  var c = config
  return  !!(c.url.protocol && c.url.host && c.url.path && c.token)
}

/**
 * Omit default ports for http and https from urls
 * @param {String} the url to be pruned
 * @return {String} url without port number if port matches default for protocol.
 * @api private
 */
function _pruneDefaultPorts(urlToPrune) {
  var urlObj = url.parse(urlToPrune)
  if((urlObj.protocol == 'http' && urlObj.port == 80) || (urlObj.protocol == 'https' && urlObj.port == 443)){
    delete urlObj.port
  }
  return url.format(urlObj)
}
