
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
var chokidar = require('chokidar');

var root = process.argv[2];
if (!root) {
	throw 'Usage: node app.js <path-to-directory>';
}
root = path.resolve(root);

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
app.use('/components', express.static(path.join(__dirname, 'components')));

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
	console.log('connected');

	function on_file_change(e, filename) {
		socket.emit('change', filename);
	}

	var watcher = chokidar.watch(root, {
		ignored: /\.git|node_modules/,
		ignoreInitial: true,
		persistent: true
	});
	watcher.on('add', on_file_change.bind(this, 'add'));
	watcher.on('change', on_file_change.bind(this, 'change'));
	watcher.on('unlink', on_file_change.bind(this, 'unlink'));
});

