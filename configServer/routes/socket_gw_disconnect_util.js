/**
 * Created by amit on 22/12/16.
 */

var globals = require("../globals"),
    eventEmitter = globals.eventEmitter;

var gw_state_col = require("../model/gw_state_col");

var socket_manager = require("./socket_manager"),
    Usergws = require("../model/usergws");

module.exports.gw_disconnected = function (socket, gw) {

    //update state of gateway in db
    var state_data = {};
    state_data.gw_state = 0;
    state_data.gw_uuid = gw.uuid;
    state_data.email = gw.email;
    gw_state_col.findOneAndUpdate({"uuid": gw.uuid}, state_data, {upsert: true}, function (err, doc) {
        if (err) {
            console.log("Error: updating the offline state of gateway");
            return;
        }
    });

    socket_manager.remove_socket_from_db(socket);
    console.log('client disconnected');
    var updateData = {online: 0};
    Usergws.findOneAndUpdate(gw, updateData, function (err, numbereffected, raw) {
        if(err){
            console.log("error : updating offline status of gw");
        }
    });
    eventEmitter.emit('gw_offline', {"creds": gw});
    socket.disconnect(true);
};