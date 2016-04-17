// var LocalStrategy = require('passport-local').Strategy;
// var User = require('../model/User');
//
// module.exports = function(passport) {
//     // used to serialize the user for the session
//     passport.serializeUser(function(user, done) {
//         done(null, user.id);
//     });
//
//     // used to deserialize the user
//     passport.deserializeUser(function(id, done) {
//         User.findById(id, function(err, user) {
//             done(err, user);
//         });
//     });
//
//     passport.use(new LocalStrategy(
//         function (username, password, done) {
//             console.log("authenticating the user");
//             User.findOne({'local.username': username}, function (err, user) {
//                 if (err)
//                     return done(err, { message : 'Unknown Error' });
//
//                 if (!user)
//                     return done(null, false, { message : 'User not found' });
//                     user.verify
//                 if (!user.validPassword(password))
//                     return done(null, false, { message : 'Password Incorrect' });
//
//                 return done(null, user);
//             });
//         }
//     ));
// };



module.exports = function(app, passport) {
    var LocalStrategy   = require('passport-local').Strategy;
    var mongoose = require('mongoose');
    var User = mongoose.model('User');
    var Usergws = mongoose.model('Usergws');
    // var User            = require('../model/user');
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
                var gw = {
                    email : req.body.email,
                    subscribeKey : req.body.subscribe_key,
                    publishKey : req.body.publish_key,
                    channelName : req.body.channel_name
                };
                var gwDoc = new Usergws(gw);

                Usergws.findOne(gw, function(err, user){
                    if(err){
                        console.log(err);
                    }
                    if(user){
                        console.log('creds already exists.');
                    }
                    else{
                        gwDoc.save(function(err){
                            if(err)
                                console.log(err);
                            console.log('new user added successfully');
                        });
                    }
                });
                

                app.locals.connected_gateways += 1;
                return done(null, user);
            });

        }));
};
