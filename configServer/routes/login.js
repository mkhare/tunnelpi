var loginModules = require('./loginModules');

module.exports = function (app, passport) {

    app.get('/', function (req, res) {
        loginModules.logincheck(req.session, res, null);
    });

    app.post('/login', passport.authenticate('local-login', { failureRedirect : '/', failureFlash : true }), function (req, res) {
        console.log('inside login');
       loginModules.logincheck(req.user, res, req);
    });

    app.post('/', passport.authenticate('gateway-auth'), function (req, res) {
	res.writeHead(200, {'Content-Type' : 'text/plain'});
	res.end('response for posted data');
    });
    
    app.get('/logout', function (req, res) {
        req.session.destroy(function (err) {
            if(err) console.log(err);
        });
        res.render('index', {title: "Login or Signup"});
    });

    app.get('/login', function (req, res) {
        loginModules.logincheck(req.session, res, null);
    });
    
    app.get('/fetch_peripherals', function (req, res) {
        loginModules.fetch_peripherals(req, res); 
    })

    app.get('/fetch_gws', function (req, res) {
        loginModules.fetch_gws(req, res);
    })
    
}