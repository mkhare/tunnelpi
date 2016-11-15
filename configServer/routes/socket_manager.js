/**
 * Created by amit on 10/8/16.
 */
var gw_sockets = require('../model/gw_sockets');
var bFT_sockets = require('../model/browser_FT_sockets');
var bProfile_sockets = require('../model/browser_profile_sockets');

module.exports.add_socket_to_db = function (socket, creds) {
    var doc = new gw_sockets({uuid : creds.uuid, sock_id: socket.id, creds : creds});
    doc.save(function (err) {
        if(err){
            console.log("error while adding socket to db");
        }
        console.log("socket added to db");
    })
};

module.exports.remove_socket_from_db = function (socket) {
    gw_sockets.findOneAndRemove({sock_id : socket.id}, function (err) {
        if(err){
            console.log('socket not present in db');
        }
        console.log('socket removed from db');
    })
};

module.exports.add_browser_socket_to_db = function (socket, username) {
    var doc = new bFT_sockets({email : username, sock_id : socket.id});
    doc.save(function (err) {
        if(err){
            console.log("error while adding browser socket to db");
        }
        console.log("browser socket added to db");
    })
}

module.exports.remove_browser_socket_from_db = function (socket) {
    bFT_sockets.findOneAndRemove({sock_id : socket.id}, function (err) {
        if(err){
            console.log("browser socket not present in db");
        }
        console.log("browser socket removed from db");
    })
}

module.exports.add_profile_socket_to_db = function (socket, username) {
    var doc = new bProfile_sockets({email : username, sock_id : socket.id});
    doc.save(function (err) {
        if(err){
            console.log("error : adding profile socket to db");
        } else {
            console.log("success : profile socket added to db");
        }
    })
}

module.exports.remove_profile_socket_from_db = function (socket) {
    bProfile_sockets.findOneAndRemove({sock_id : socket.id}, function (err) {
        if(err){
            console.log("error : profile socket not present in db");
        } else {
            console.log("success : profile socket removed from db");
        }
    })
}
