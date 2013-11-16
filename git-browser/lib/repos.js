var chokidar = require('chokidar');
var events = require('events');
var exec = require('exec-sync');
var glob = require('glob');
var path = require('path');

var repos = [];

function repo_git_status(p, root) {
	var status;
	try {
		root = root || '';
		var worktree = path.join(root, p.slice(0, p.length - 5));
		var cmd = 'git --git-dir=' + path.join(root, p) + ' --work-tree=' + worktree + ' ';
		var gs = exec(cmd + 'status');
		var ab = exec(cmd + 'rev-list --left-right --count origin/master...HEAD');
		status = {
			path: worktree,
			clean: gs.indexOf('nothing to commit') !== -1,
			untracked: gs.indexOf('Untracked files') !== -1,
			status: gs,
			behind: ab.split('	')[0],
			ahead: ab.split('	')[1],
		};
	} catch (e) {
		console.log('exception', root, p);
	}
	return status;
}

exports.scan = function(root) {
	console.log('starting scan', root);
	var git = glob.sync('**/.git', {cwd: root})
	var repos = [];
	git.forEach(function(g) {
		if (g.indexOf('components') <= 0) {
			var status = repo_git_status(g, root);
			if (status) {
				repos.push(status);
			}
		}
	});
	return repos;
}

function find_git_local_repo(filename) {
	process.chdir(path.dirname(filename));
	return path.resolve(exec('git rev-parse --git-dir'));
}

function on_file_add(emitter, filename) {
	on_file_change(emitter, filename);
}

function on_file_change(emitter, filename) {
	var git = find_git_local_repo(filename);
	var status = repo_git_status(git);
	emitter.emit('repo_status', status);
}

function on_file_unlink(emitter, filename) {
	on_file_change(emitter, filename);
}

exports.watch = function(root) {
	var emitter = new events.EventEmitter();
	var watcher = chokidar.watch(root, {
		ignored: /\.git|node_modules/,
		ignoreInitial: true,
		persistent: true
	});
	watcher.on('add', on_file_add.bind(this, emitter));
	watcher.on('change', on_file_change.bind(this, emitter));
	watcher.on('unlink', on_file_unlink.bind(this, emitter));
	return emitter;
}