
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var io = require('socket.io');
var fs = require('fs');

var root = process.argv[2];
if (!root) {
	throw 'Usage: node app.js <path-to-directory>';
}
console.log('root', root);
root = path.resolve(root);
console.log('root', root);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var webserver = http.createServer(app);

webserver.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

server = io.listen(webserver);

server.sockets.on('connection', function(socket) {
	console.log('hello world!');
	socket.emit('news', {hello: 'world!'});

	var watcher = fs.watch(root);
	console.log('watching', root);
	console.log(watcher);
	watcher.on('change', function(event, filename) {
		console.log('watch', event, filename);
		socket.emit('kjsadhkjasd');
	});
});
