var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var passport = require('passport');
var configfile = require('./config/config');
var session = require('express-session');

mongoose.connect(configfile.dburl);

var app = express();

var server = http.createServer(app);
var port = 8888;
server.listen(port, 'localhost', function () {
    console.log('Server is running...');
});
app.locals.connected_gateways = 0;

app.set('views', path.join(__dirname, 'views'));
app.use('/scripts', express.static(__dirname + '/node_modules/semantic-ui/dist/'));
app.set('view engine', 'hjs');

app.use(session({secret:'ssshhh', resave: true, saveUninitialized:true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'hellothere', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

require('./routes/login')(app, passport);
require('./config/passport')(app, passport);
require('./routes/signup')(app, passport);
require('./routes/profile')(app);
var User = require('./model/User');
var Usergws = require('./model/Usergws');

app.get('/', function (req, res) {
    if(req.session.email){
        Usergws.find({email : req.session.email}, function (err, usersfromDB) {
            if(err) console.log(err);
            res.render('profile', {connected_gateways: usersfromDB.length, user : req.session.email, usersList : usersfromDB});
        });
    }
    else {
        res.render('index', {title: "Login or Signup"});
    }
});