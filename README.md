# Twitter Social Bot

Basic wrapper around twitter module with handy methods.

## Usage

### Install dependencies

```bash
yarn
```

### Get twitter credentials

[Google it... :)](https://www.google.com/search?q=twitter+api+credentials)

### Create entry point

something like `index.js`, and add this:

```javascript
socialbot.initClient({
	consumer_key: "get",
	consumer_secret: "your",
	access_token_key: "own",
	access_token_secret: "credentials"
});

socialbot
	.getFollowers()
	.then(followers => {
		console.log("socialbot got followers:", followers.ids.length);
	})
	.catch(err => {
		console.log("something went wrong", err);
	});
```

### Run it

```bash
node index.js
```

## Used by:

- [@AnsiBot](http://www.twitter.com/AnsiBot) / [github.com/raurir/AnsiBot](https://github.com/raurir/AnsiBot)
- [@StatsOfOrigin](http://www.twitter.com/StatsOfOrigin) / [github.com/raurir/StatsOfOrigin](https://github.com/raurir/StatsOfOrigin)
- [@FunkyVector](http://www.twitter.com/FunkyVector) / Infinite print project
