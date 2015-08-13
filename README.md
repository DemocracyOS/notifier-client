notifier-client
===============

Simple client for https://github.com/DemocracyOS/notifier, forked from [likeastore](https://github.com/likeastore/notifier)

## Usage

Install from npm,

```bash
$ npm install notifier-client
```

Initialize the client,

```js
var notifier = require('notifier-client')({
	url: 'http://notifier.example.com/api/events',
	token: 'your-custom-token'
});
```

Use the `notify` method,

```js
notifier.notify({
	event: 'user-resistered',
	user: 'a@a.com',
	data: {registered: new Date() }
}, function () {
	// notified!
});
```

Or use `to` and `withData` methods,

```js
notifier.notify('user-registered')
	.to('a@a.com')
	.withData({registered: new Date() })
	.send(function () {
		// notified!
	});
```

In both cases `callback` parameter is optional,

```js
notifier.notify({
	event: 'user-resistered',
	user: 'a@a.com',
	data: {registered: new Date() });

// or

notifier.notify('user-registered')
	.to('a@a.com')
	.withData({registered: new Date() })
	.send();
```

## TODOS

* Tests

## License

MIT
