var mongoose = require('mongoose');
var User = mongoose.model('User');
var usergws = mongoose.model('usergws');
var peripherals = require('../model/peripherals');

var fetch_peripherals = function (req, res) {
    console.log("Req received : fetch peripheral");
    var email = req.query.email;
    if (email !== 'undefined' && email && req.session.email === email) {
        peripherals.find({"email": email}, null, {sort: {gw_uuid: 1}}, function (err, peripherals_data) {
            res.json(peripherals_data);
        });
    } else {
        console.log("error : wrong request received");
        res.render('index', {title: "Login or Signup"});
    }
}

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
                console.log(err);
                return;
            }

            if (req) {
                req.session.email = obj.email;
            }
            //console.log("mongoData : " + usersfromDB);
            // var temp = formattedData(usersfromDB);
            res.render('profile.ejs', {
                connected_gateways: usersfromDB.length,
                user: obj.email,
                mongoData: usersfromDB
            });
        })
    }
    else {
        res.render('index', {title: "Login or Signup"});
    }
}

// shifted this to browser side (to decrease load on server) - not using it now
var formattedData = function (mongoData) {
    var lastChannel = '';
    if (mongoData && mongoData[0]) {
        lastChannel = mongoData[0].channelName;
    }
    else {
        return '';
    }


    var finalData = '<ul>'
    mongoData.forEach(function (item, index, array) {
        var imgid = item.uuid + item.subscribeKey + item.publishKey + item.channelName + item.email;
        imgid = imgid.toString().split('').reverse().join('');
        imgid = imgid.split('@').join('');
        imgid = imgid.split('.').join('');

        if (finalData == '<ul>') {
            finalData += '<li><h4>Channel Name : ' + item.channelName + '</h4><ul><li><h4 class="ui header">Gateway UUID : ' + item.uuid + ' &nbsp;<div id="' + imgid + '" class="dot"></div></h4></li>';
        }
        else if (item.channelName == lastChannel) {
            finalData += '<li><h4 class="ui header">Gateway UUID : ' + item.uuid + ' &nbsp;<div id="' + imgid + '" class="dot"></div></h4></li>';
        }
        else {
            finalData += '</ul></li><br>';
            lastChannel = item.channelName;
            finalData += '<li><h4> Channel Name : ' + item.channelName + '</h4><ul><li><h4 class="ui header">Gateway UUID : ' + item.uuid + ' &nbsp;<div" id="' + imgid + '" class="dot"></div></h4></li>';
        }
    });

    if (finalData == '<ul>') {
        finalData += '</ul>';
    }
    else {
        finalData += '</ul></li></ul>';
    }

    console.log('final data : ' + finalData);
    return finalData;
}

module.exports.logincheck = logincheck;
module.exports.formattedData = formattedData;
module.exports.fetch_peripherals = fetch_peripherals;
module.exports.fetch_gws = fetch_gws;