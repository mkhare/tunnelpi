var mongoose = require('mongoose');
var User = mongoose.model('User');
var usergws = mongoose.model('usergws');

var fetch_gws = function (req, res) {
    console.log("Req received : fetch gateways");
    var email = req.query.email;
    if (email !== 'undefined' && email && req.session.email === email) {
        usergws.find({"email": email}, null, {sort: {uuid: 1}}, function (err, gws_data) {
            res.json(gws_data);
        });
    } else {
        console.log("error : wrong request received");
        res.render('index', {title: "Login or Signup"});
    }
}

var logincheck = function (obj, res, req) {
    if (obj.email) {
        usergws.find({email: obj.email}, null, {sort: {channelName: 1}}, function (err, usersfromDB) {
            if (err) {
                console.log("Error: logging in");
                return;
            }
            if (req) {
                req.session.email = obj.email;
            }

            res.render('profile.ejs');
        })
    }
    else {
        res.render('index', {title: "Login or Signup"});
    }
}

module.exports.logincheck = logincheck;
module.exports.fetch_gws = fetch_gws;