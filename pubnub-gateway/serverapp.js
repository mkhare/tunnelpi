var express = require('express');
var http = require('http');
var path = require('path');
var cons = require('consolidate');
var fs = require('fs');
var proj_config = require('./proj_config');

function download_file(filename, res) {
    fs.stat(filename, function (err, stat) {
        if (err == null) {
            res.download(filename);
        }
        else {
            console.log('file not found');
            res.render('index', {});
        }
    });
}

// function get_ngrok_addr() {
//     var port = proj_config.set1.extras.serverport;
//     http.get({'host': 'localhost', 'port': 4040, 'path': '/api/tunnels'}, function (resp) {
//         resp.on('data', function (tunnelsdata) {
//             // console.log('tunnels : ');
//             tunnelsdata = JSON.parse(tunnelsdata);
//             tunnelsdata = tunnelsdata.tunnels;
//
//             for(var i in tunnelsdata){
//                 console.log("tunnelsdata : " + JSON.stringify(tunnelsdata[i]));
//                 if(tunnelsdata[i].config.addr == "localhost:" + port){
//                     console.log("pu : " + tunnelsdata[i].public_url);
//                     break;
//                 }
//             }
//
//         })
//     });
// }

module.exports = function () {
    // ngrok_addr();
    console.log("starting server...");
    var app = express();
    var server = http.createServer(app);
    var port = proj_config.set1.serverport;
    server.listen(port, '0.0.0.0', function () {
        if (process.argv && process.argv.length > 2 && process.argv[2] != 'nolog') {
            console.log('incorrect command line argument');
            process.exit(1);

        } else {
            console.log('Server is running...');
        }
    });

    app.set('views', path.join(__dirname, 'views'));
    app.engine('ejs', cons.ejs);
    app.set('view engine', 'hjs');
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/', function (req, res) {
        var file = __dirname + "/public/btmonlog.txt";
        download_file(file, res);
    });
}