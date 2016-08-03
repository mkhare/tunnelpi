/**
 * Created by amit on 2/8/16.
 */
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Usergws = mongoose.model('Usergws');

var logincheck = function (obj, res, req) {
    if(obj.email){
        Usergws.find({email : obj.email}, null, {sort : {channelName : 1}}, function (err, usersfromDB) {
            if(err){
                console.log(err);
                return;
            }

            if(req){
                req.session.email = obj.email;
            }
            //console.log("mongoData : " + usersfromDB);
            // var temp = formattedData(usersfromDB);
            res.send({connected_gateways: usersfromDB.length, user : obj.email, mongoData : usersfromDB});
        })
    }
    else {
        res.sendStatus(404);
    }
}

module.exports.logincheck = logincheck;