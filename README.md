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
	host: 'notifier.example.com',
	token: '3943fa9c7eb8b13071582910e76d737e1bf91abe'
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

* Add some tests
* Make it a `component`

## License

MIT