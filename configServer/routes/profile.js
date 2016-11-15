var proj_config = require('../proj_config');
var usergws = require('../model/usergws');
var peripherals = require('../model/peripherals');
var server_util = require('../server_util');
var globals = require('../globals');
var eventEmitter = globals.eventEmitter;
var Browser_socket = require('./profile_comm');

module.exports = function (app, io) {

    var profile_nsp = io.of("/profile_nsp");

    profile_nsp.on("connection", function (socket) {

        //This event is used to notify the client about already online gateways.
        socket.on('beConnect', function (data) {
            var email = data.uname;
            var browser_socket = new Browser_socket(email, socket);
            browser_socket.init_comm();
        });
    });
    
    app.get('/profile', function (req, res) {
        res.writeHead(200, {"content-type" : "text/plain"});
        res.write("on profile page");
        res.end();
    });
};
