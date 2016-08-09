/**
 * Created by amit on 5/8/16.
 */

var loginModules = require('./loginModules');
module.exports = function (app, eventEmitter) {
    app.get('/file_transfer_home', function (req, res) {
        if(req.session.email){
            res.render('file_transfer_home.ejs',{});
        } else {
            res.render('index', {title: "Login or Signup"});
        }
    })

    app.post('/file_transfer_init', function (req, res) {
        if(req.session.email){
            var sourcegw = req.body.sourcegw;
            var destgw = req.body.destgw;
            eventEmitter.emit('ft_send_init_cmd', {sgw : sourcegw, dgw : destgw});
            loginModules.logincheck(req.session, res, null);
        } else {
            res.render('index', {title: "Login or Signup"});
        }
    })
};