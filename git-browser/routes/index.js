
/*
 * GET home page.
 */

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var exec = require('exec-sync');

var root = process.argv[2];
if (!root) {
	throw 'Usage: node app.js <path-to-directory>';
}
root = path.resolve(root);

function find_repos(root) {
	var res = glob.sync('**/.git', {cwd: root})
	console.log('find', res);
}

exports.index = function(req, res){
	fs.readdir(root, function(err, files) {
		fs.readFile(__dirname + '/../views/index.html', 'utf8', function(err, str) {
			str = str.replace('##ROOT##', JSON.stringify(root));
			res.setHeader('Content-Type', 'text/html');
			res.setHeader('Content-Length', str.length);
			res.end(str);
		});
	});
};