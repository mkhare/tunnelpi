var express = require('express');
var http = require('http');
var path = require('path');
var cons = require('consolidate');
var fs = require('fs');

function download_file(filename, res){
	fs.stat(filename, function(err, stat) {
		if(err == null) {
			res.download(filename);
		} 
		else {
			res.sendStatus(404);
		}
	});
}

module.exports = function(){
	console.log("starting server...");
	var app = express();
	var server = http.createServer(app);
	var port = 9999;
	server.listen(port, '0.0.0.0', function () {
		if(process.argv && process.argv.length > 2 && process.argv[2] != 'nolog'){
			console.log('incorrect command line argument');
			process.exit(1);
			
		} else {
			console.log('Server is running...');
		}
	});

	app.set('views', path.join(__dirname, 'views'));
	app.engine('ejs', cons.ejs);
	app.use(express.static(path.join(__dirname, 'public')));

	app.get('/', function(req, res){
		var file = __dirname + "/public/btmonlog.txt";
		download_file(file, res);
	});
}