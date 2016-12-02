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
var server_util = require('./server_util');

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
var peripherals = require('./model/peripherals');
var bProfile_sockets = require('./model/browser_profile_sockets');

var app = express();

var server = http.createServer(app);
var port = 8888;
server.listen(port, '0.0.0.0', function () {
    console.log('Server is running...');
    var updatedata = {online: 0};
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

    peripherals.update({}, updatedata, {multi: true}, function (err) {
        if (err) {
            console.log("error : updating data of peripherals collection at startup");
        }
    })
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
require('./routes/file_transfer')(app, eventEmitter, io);
require('./routes/network_monitoring')(app, io);
require('./routes/port_monitoring')(app, io);
var loginModules = require('./routes/loginModules');

module.exports.eventEmitter = eventEmitter;

var gwDisconnectHandler = function (socket, gw, tagid) {
    socket_manager.remove_socket_from_db(socket);
    console.log('client disconnected');
    var updateData = {online: 0};
    Usergws.findOneAndUpdate(gw, updateData, function (err, numbereffected, raw) {
        if(err){
            console.log("error : updating offline status of gw");
        }
    });
    eventEmitter.emit('gw_offline', {"creds": gw});
    socket.disconnect(true);
};

var peripheral_online = function (peripheral, socket, creds) {
    // var peripheral_data = {"peripheral" : peripheral};
    eventEmitter.emit('peripheral_online', peripheral);
}

var sock_connected_to_gw = function (socket, creds) {
    eventEmitter.emit('gw_online', {"creds": creds});

    socket_manager.add_socket_to_db(socket, creds);
    socket.on('ft_logdata', function (data) {
        var doc = new ft_log(data);
        doc.save(function (err) {
            if (err) {
                console.log("error : saving log to db : ", data);
            }
            eventEmitter.emit('beft_logdata', data);
        });
    });

    socket.on("upload_peripheral_data", function (peripheral_data) {
        peripherals.findOne(peripheral_data, function (err, peripheral) {
            if (err) {
                console.log("error : finding peripheral in db");
            } else if (peripheral) {
                var updateData = {online: 1};
                Usergws.findOneAndUpdate(peripheral_data, updateData, function (err, numbereffected, raw) {
                    if (err) {
                        console.log("error : changing state to online of peripheral");
                    }
                });
                console.log("success : peripheral already present in db");
                peripheral_online(peripheral, socket, creds);
            } else {
                peripheral_data.online = 1;
                var doc = new peripherals(peripheral_data);
                doc.save(function (err) {
                    if (err) {
                        console.log("error : saving peripheral to db");
                    } else {
                        console.log("success : peripheral saved to db");
                        peripheral_online(peripheral_data, socket, creds);
                    }
                });
            }
        })
    });

    socket.on("peripheral_disconnected", function (peripheral_data) {
        eventEmitter.emit("peripheral_disconnected", peripheral_data);
    })
}

var gw_nsp = io.of("/");
gw_nsp.on("connection", function (socket) {
    console.log('gateway connected');

    socket.on('creds', function (data) {
        console.log("message from client " + data);
        var imgid = data.uuid + data.subscribe_key + data.publish_key + data.channel_name + data.email;
        imgid = imgid.toString().split('').reverse().join('');
        imgid = imgid.split('@').join('');
        imgid = imgid.split('.').join('');

        var gw = {
            "uuid": data.uuid,
            "email": data.email,
            "subscribe_key": data.subscribe_key,
            "publish_key": data.publish_key,
            "channel_name": data.channel_name
        };
        var connectedDevices = data.devices;

        // console.log('imgid : ' + imgid);
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
                        sock_connected_to_gw(socket, gw);
                        console.log("user online event emitted (existing user)");
                        var updateData = {online: 1};
                        Usergws.findOneAndUpdate(gw, updateData, function (err, numbereffected, raw) {
                            if (err) {
                                console.log("error : updating the online state of existing gw");
                            }
                        });
                    }
                    else {
                        var tempgwobj = gw;
                        tempgwobj.devices = connectedDevices;

                        var gwDoc = new Usergws(tempgwobj);
                        gwDoc.save(function (err) {
                            if (err)
                                console.log(err);
                            console.log('new user added successfully');
                        });


                        var updateData = {online: 1};
                        Usergws.findOneAndUpdate(gw, updateData, function (err, numbereffected, raw) {
                            sock_connected_to_gw(socket, gw);
                            console.log("user online event emitted (new user)");
                        });
                    }

                    socket.on('disconnect', function (eventdata) {
                        gwDisconnectHandler(socket, gw, imgid);
                    });
                });
            }
        });

    })
})