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

var eventEmitter = new events.EventEmitter();

mongoose.connect(configfile.dburl);
var User = require('./model/User');
var Usergws = require('./model/Usergws');

var app = express();

var server = http.createServer(app);
var port = 8888;
server.listen(port, 'localhost', function () {
    console.log('Server is running...');
    var updatedata = {online: 0};
    Usergws.update({}, updatedata, {multi:true}, function (err) {
        if(err)
            console.log("error updating data at server start");
    });
});
var io = require('socket.io')(server)
app.locals.connected_gateways = 0;

app.set('views', path.join(__dirname, 'views'));
app.use('/scripts', express.static(__dirname + '/node_modules/semantic-ui/dist/'));
app.set('view engine', 'hjs');

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
require('./routes/profile')(app);
var loginModules = require('./routes/loginModules');

app.get('/', function (req, res) {
    loginModules.logincheck(req.session, res, null);
});

var gwDisconnectHandler = function (socket, gw, imgid) {
    console.log('client disconnected');
    var updateData = {online : 0};
    Usergws.findOneAndUpdate(gw, updateData, function (err, numbereffected, raw) {

    });
    eventEmitter.emit('UserOffline', {tagid : imgid});
    socket.disconnect(true);
};

io.sockets.on("connection", function (socket) {
    console.log('client connected');

    eventEmitter.on('UserOnline', function (data) {
        console.log('inside useronline event');
        socket.emit('beUserOnline', data);
    })

    eventEmitter.on('UserOffline', function (data) {
        socket.emit('beUserOffline', data);
    })

    //This event is used to notify the client about already online gateways.
    socket.on('beConnect', function (data) {
        console.log("message from browser : " + data.msg);
        Usergws.find({online: 1}, function (err, mongodata) {
            if(err){
                console.log('error while finding data in database');
                return;
            }

            socket.emit('mongodata', {data : mongodata});
        })
    });
    

    socket.on('creds', function (data) {
        console.log("message from client " + data);
        var imgid = data.uuid + data.subscribe_key + data.publish_key + data.channel_name + data.email;
        imgid = imgid.toString().split('').reverse().join('');
        imgid = imgid.split('@').join('');
        imgid = imgid.split('.').join('');

        var gw = {
            uuid : data.uuid,
            email : data.email,
            subscribeKey : data.subscribe_key,
            publishKey : data.publish_key,
            channelName : data.channel_name
        };

        console.log('imgid : ' + imgid);
        User.findOne({email : data.email}, function (err, user) {
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
                Usergws.findOne(gw, function(err, user){
                    if(err){
                        console.log(err);
                    }
                    if(user){
                        console.log('In socket stream : creds already exists.');
                        console.log("auth success : %j", gw);
                        eventEmitter.emit('UserOnline', {tagid : imgid});
                        var updateData = {online : 1};
                        Usergws.findOneAndUpdate(gw, updateData, function (err, numbereffected, raw) {

                        });
                        // socket.on('disconnect', function (eventdata) {
                        //     gwDisconnectHandler(socket, gw, imgid);
                        // });
                    }
                    else{
                        eventEmitter.on('newUserAdded', function (eventdata) {
                            var updateData = {online : 1};
                            Usergws.findOneAndUpdate(gw, updateData, function (err, numbereffected, raw) {

                            });
                        });
                        // socket.on('disconnect', function (eventdata) {
                        //     gwDisconnectHandler(socket, gw, imgid);
                        // });
                    }

                    socket.on('disconnect', function (eventdata) {
                        gwDisconnectHandler(socket, gw, imgid);
                    });
                });
            }
        });

    })
})