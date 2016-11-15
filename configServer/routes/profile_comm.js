/**
 * Created by amit on 30/8/16.
 */

var proj_config = require('../proj_config');
var usergws = require('../model/usergws');
var peripherals = require('../model/peripherals');
var server_util = require('../server_util');
var globals = require('../globals');
var eventEmitter = globals.eventEmitter;
var socket_manager = require('./socket_manager');

module.exports = Browser_socket;

function Browser_socket(email, socket) {
    this.email = email;
    this.socket = socket;

    this.event_listeners();
}

Browser_socket.prototype.event_listeners = function () {
    var self = this;

    this.gw_online_event_listener = function (data) {
        var creds = data.creds;
        if (self.email == creds.email) {
            console.log("event : gw online");
            var tagid = server_util.build_gws_tagid(creds);
            self.socket.emit('beUserOnline', {"tagid": tagid});
        }
    };

    this.gw_offline_event_listener = function (data) {
        var creds = data.creds;
        if (self.email == creds.email) {
            console.log("event : gw offline");
            var tagid = server_util.build_gws_tagid(creds);
            self.socket.emit('beUserOffline', {"tagid": tagid});
        }
    };

    this.peripheral_online_event_listener = function (peripheral) {
        var tagid = server_util.build_pps_tagid(peripheral);
        console.log("event : online : Peripheral tag id : " + tagid);
        var data_to_send = {"tagid": tagid};
        self.socket.emit('be_peripheral_online', data_to_send);
    };

    this.peripheral_offline_event_listener = function (peripheral) {
        var tagid = server_util.build_pps_tagid(peripheral);
        console.log("event : offline : Peripheral tag id : " + tagid);
        var data_to_send = {"tagid": tagid};
        self.socket.emit('be_peripheral_offline', data_to_send);
    };

}

Browser_socket.prototype.gw_event_handlers = function () {
    var self = this;

    eventEmitter.on('gw_online', self.gw_online_event_listener);

    eventEmitter.on('gw_offline', self.gw_offline_event_listener);

    // console.log("debug : no of listeners for user_online event : " + eventEmitter.listenerCount("gw_online"));
}

Browser_socket.prototype.init_comm = function () {
    var self = this;
    self.gw_event_handlers();

    eventEmitter.on("peripheral_online", this.peripheral_online_event_listener);

    eventEmitter.on("peripheral_disconnected", this.peripheral_offline_event_listener);

    socket_manager.add_profile_socket_to_db(self.socket, self.email);

    var eon_data = {
        publish_key: proj_config.set1.publish_key,
        subscribe_key: proj_config.set1.subscribe_key
    };
    self.socket.emit('eoninit', eon_data);

    usergws.find({"email": self.email, online: 1}, function (err, mongodata) {
        if (err) {
            console.log('error : finding usergws data in database');
        } else {
            self.socket.emit('mongodata', {data: mongodata});
        }
    });

    peripherals.find({"email": self.email, online: 1}, function (err, peripheral_data) {
        if (err) {
            console.log("error : finding online peripherals");
        } else {
            var pp_tagids = [];
            peripheral_data.forEach(function (peripheral) {
                var tagid = server_util.build_pps_tagid(peripheral);
                pp_tagids.push(tagid);
            });
            self.socket.emit("be_online_peripheral_data", pp_tagids);
        }
    });

    self.socket.on("disconnect", function (_) {
        socket_manager.remove_profile_socket_from_db(self.socket);
        eventEmitter.removeListener("gw_online", self.gw_online_event_listener);
        eventEmitter.removeListener("gw_offline", self.gw_offline_event_listener);
        eventEmitter.removeListener("peripheral_online", self.peripheral_online_event_listener);
        eventEmitter.removeListener("peripheral_offline", self.peripheral_offline_event_listener);
    });
}