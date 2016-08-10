/**
 * Created by amit on 10/8/16.
 */
var gw_sockets = require('../model/gw_sockets');

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
