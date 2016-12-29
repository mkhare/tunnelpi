var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var passport = require('passport');
var configfile = require('./config/config');
var session = require('express-session');
var events = require('events');
var cons = require('consolidate');
var proj_config = require('./proj_config');
var globals = require('./globals');
var eventEmitter = globals.eventEmitter;
var socket_manager = require('./routes/socket_manager');
var server_util = require('./server_util'),
    socket_gw_connect_util = require("./routes/socket_gw_connect_util"),
    socket_gw_disconnect_util = require("./routes/socket_gw_disconnect_util");

var pubnub = require("pubnub")({
    publish_key: proj_config.set1.publish_key,
    subscribe_key: proj_config.set1.subscribe_key
});

mongoose.connect(configfile.dburl);
var User = require('./model/user');
var Usergws = require('./model/usergws');
var gw_sockets = require('./model/gw_sockets');
var bFT_sockets = require('./model/browser_FT_sockets');
var ft_log = require('./model/ft_log');
var bProfile_sockets = require('./model/browser_profile_sockets');
var gw_location_col = require('./model/gw_location_col');
var gw_state_col = require('./model/gw_state_col'),
    gw_pps_info_col = require("./model/gw_pps_info_col");

var app = express();

var server = http.createServer(app);
var port = 8888;
server.listen(port, '0.0.0.0', function () {
    console.log('Server is running...');
    var updatedata = {online: 0};

    gw_state_col.update({}, {"gw_state": 0}, {multi: true}, function (err) {
        if(err){
            console.log("Error: resetting the states of all gateways to offline");
            return;
        }
    })

    gw_sockets.remove({}, function (err) {
        if (err) {
            console.log("error : cleaning gateway sockets collection");
        }
    })

    bFT_sockets.remove({}, function (err) {
        if (err) {
            console.log("error : cleaning browser ft sockets collection");
        }
    })

    bProfile_sockets.remove({}, function (err) {
        if (err) {
            console.log("error : cleaning browser profile sockets collection");
        }
    })

    Usergws.update({}, updatedata, {multi: true}, function (err) {
        if (err)
            console.log("error updating data at server start");
    });
});

var io = require('socket.io')(server)
app.locals.connected_gateways = 0;

app.set('views', path.join(__dirname, 'views'));
app.use('/scripts', express.static(__dirname + '/node_modules/semantic-ui/dist/'));
app.engine('ejs', cons.ejs);
app.set('view engine', 'hjs');
// app.engine('hogan', cons.hogan);

app.use(session({secret: 'ssshhh', resave: true, saveUninitialized: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'hellothere', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

require('./routes/login')(app, passport);
require('./config/passport')(app, passport, eventEmitter);
require('./routes/signup')(app, passport);
require('./routes/profile')(app, io);
require('./routes/network_monitoring')(app, io);
require('./routes/port_monitoring')(app, io);
require("./routes/dfu_console")(app);
var loginModules = require('./routes/loginModules');

module.exports.eventEmitter = eventEmitter;

var gw_nsp = io.of("/");
gw_nsp.on("connection", function (socket) {
    console.log('gateway connected');

    socket.on('creds', function (data) {
        console.log("message from client " + data);

        var gw = {
            "uuid": data.uuid,
            "email": data.email,
            "subscribe_key": data.subscribe_key,
            "publish_key": data.publish_key,
            "channel_name": data.channel_name
        };

        User.findOne({email: data.email}, function (err, user) {
            if (err) {
                socket.disconnect(true);
                return;
            }
            else if (!user) {
                console.log('user not found');
                socket.disconnect(true);
            }
            else if (!user.validPassword(data.password)) {
                socket.disconnect(true);
                console.log('Invalid password');
                return;
            }
            else {
                Usergws.findOne(gw, function (err, user) {
                    if (err) {
                        console.log(err);
                        socket.disconnect(true);
                    }
                    if (user) {
                        socket_gw_connect_util.gw_connected(app, socket, gw);
                        console.log("user online event emitted (existing user)");
                    }
                    else {
                        var gwDoc = new Usergws(gw);
                        gwDoc.save(function (err) {
                            if (err) {
                                console.log("Error: adding new user to db");
                                return;
                            }
                            console.log('new user added successfully');
                            socket_gw_connect_util.gw_connected(app, socket, gw);
                        });
                    }

                    socket.on('disconnect', function (eventdata) {
                        socket_gw_disconnect_util.gw_disconnected(socket, gw);
                    });
                });
            }
        });

    })
})