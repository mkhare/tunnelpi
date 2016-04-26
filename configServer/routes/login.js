module.exports = function (app, passport) {
    var loginModules = require('./loginModules');

    app.post('/login', passport.authenticate('local-login', { failureRedirect : '/', failureFlash : true }), function (req, res) {
        console.log('inside login');
       loginModules.logincheck(req.user, res, req);
    });

    app.post('/', passport.authenticate('gateway-auth', function (req, res) {
    }));
    
    app.get('/logout', function (req, res) {
        req.session.destroy(function (err) {
            if(err) console.log(err);
        });
        res.render('index', {title: "Login or Signup"});
    });

    app.get('/login', function (req, res) {
        loginModules.logincheck(req.session, res, null);
    });
    
}