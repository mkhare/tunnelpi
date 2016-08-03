var loginModules = require('./ard_loginMods');
module.exports = function (app, passport) {
    app.post('/ard_login', passport.authenticate('local-login', { failureRedirect : '/', failureFlash : true }), function (req, res) {
        console.log('inside login');
        loginModules.logincheck(req.user, res, req);
    });
}