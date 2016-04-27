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

            var temp = formattedData(usersfromDB);
            res.render('profile', {connected_gateways: usersfromDB.length, user : obj.email, usersList : temp});
        })
    }
    else {
        res.render('index', {title: "Login or Signup"});
    }
}

var formattedData = function (mongoData) {
    var lastChannel = '';
    if(mongoData && mongoData[0]){
        lastChannel = mongoData[0].channelName;
    }
    else{
        return '';
    }


    var finalData = '<ul>'
    mongoData.forEach(function (item, index, array) {
        var imgid = item.uuid + item.subscribeKey + item.publishKey + item.channelName + item.email;
        imgid = imgid.toString().split('').reverse().join('');
        imgid = imgid.split('@').join('');
        imgid = imgid.split('.').join('');

        if(finalData == '<ul>'){
            finalData += '<li><h4>Channel Name : ' + item.channelName + '</h4><ul><li><h4 class="ui header">Gateway UUID : ' + item.uuid + ' &nbsp;<div id="' + imgid + '" class="dot"></div></h4></li>';
        }
        else if(item.channelName == lastChannel){
            finalData += '<li><h4 class="ui header">Gateway UUID : ' + item.uuid + ' &nbsp;<div id="' + imgid + '" class="dot"></div></h4></li>';
        }
        else{
            finalData += '</ul></li><br>';
            lastChannel = item.channelName;
            finalData += '<li><h4> Channel Name : ' + item.channelName + '</h4><ul><li><h4 class="ui header">Gateway UUID : ' + item.uuid + ' &nbsp;<div" id="' + imgid + '" class="dot"></div></h4></li>';
        }
    });

    if(finalData == '<ul>'){
        finalData += '</ul>';
    }
    else{
        finalData += '</ul></li></ul>';
    }

    console.log('final data : ' + finalData);
    return finalData;
}

module.exports.logincheck = logincheck;
module.exports.formattedData = formattedData;