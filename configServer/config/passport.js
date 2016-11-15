var LocalStrategy   = require('passport-local').Strategy;
var User = require('../model/user');
var Usergws = require('../model/usergws');

module.exports = function(app, passport, eventEmitter) {
    
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            process.nextTick(function() {
                User.findOne({ email :  email }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        var newUser = new User();
                        newUser.email = email;
                        newUser.password = newUser.generateHash(password);

                        // save the user
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });

            });

        }));

    passport.use('local-login', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            console.log('Inside passport');
            console.log(email);
            console.log(password);
            User.findOne({ email :  email }, function(err, user) {
                if (err)
                    return done(err);

                if (!user) {
                    console.log('user not found');
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }

                if (!user.validPassword(password)) {
                    console.log('Invalid password');
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }

                console.log('Everything is good');
                return done(null, user);
            });

        }));

    passport.use('gateway-auth', new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            console.log('Inside passport');
            console.log(email);
            //console.log(password);
            User.findOne({ email :  email }, function(err, user) {
                if (err){
                    console.log("user does not exist");
                    return done(err);
                }

                if (!user) {
                    console.log('user not found');
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }

                if (!user.validPassword(password)) {
                    console.log('Invalid password');
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                }

                console.log('Everything is good ' + req.body.uuid);
                var gw = {
                    uuid : req.body.uuid,
                    email : req.body.email,
                    subscribeKey : req.body.subscribe_key,
                    publishKey : req.body.publish_key,
                    channelName : req.body.channel_name
                };

                Usergws.findOne(gw, function(err, user){
                    if(err){
                        console.log(err);
                    }
                    if(user){
                        console.log('creds already exists.');
                    }
                    else{
                    	var tempgwobj = gw;
                        gw.devices = req.body.devices;
                        var gwDoc = new Usergws(gw);
                        gwDoc.save(function(err){
                            if(err)
                                console.log(err);
                            console.log('new user added successfully');
                            eventEmitter.emit('newUserAdded', {gwinfo : tempgwobj});
                        });
                    }
                });
                

                app.locals.connected_gateways += 1;
                return done(null, user);
            });

        }));
};
