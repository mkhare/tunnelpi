var express = require('express');
var http = require('http');
var path = require('path');
var cons = require('consolidate');

module.exports = function(){
	console.log("starting server...");
	var app = express();
	var server = http.createServer(app);
	var port = 9999;
	server.listen(port, '0.0.0.0', function () {
		console.log('Server is running...');
	});

	app.set('views', path.join(__dirname, 'views'));
	app.engine('ejs', cons.ejs);
	app.use(express.static(path.join(__dirname, 'public')));

	app.get('/', function(req, res){
		var file = __dirname + "/public/btmonlog.txt";
		res.download(file);
	})
}