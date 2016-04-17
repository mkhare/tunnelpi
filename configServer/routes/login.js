module.exports = function (app, passport) {
    var User = require('../model/User');
    var Usergws = require('../model/Usergws');
    

    app.post('/login', passport.authenticate('local-login', { failureRedirect : '/', failureFlash : true }), function (req, res) {
        console.log('inside login');
        if(req.user) {
            var connectedgws = 0;
            var users = [];
            console.log(req.user.email);
            Usergws.find({email : req.user.email}, function (err, usersfromDB) {
                if(err) console.log(err);
                // connectedgws = usersfromDB.length;
                console.log(usersfromDB.length);
                // users = usersfromDB;
                res.render('profile', {connected_gateways: usersfromDB.length, user : req.user.email, usersList : usersfromDB});
            })
            // res.render('profile', {connected_gateways: connectedgws, user : req.user.username, usersList : users});
        }
        else
            res.render('login', { loginMessage : 'Invalid email or password' });
    });

    app.post('/', passport.authenticate('gateway-auth', function (req, res) {
    }));

}