/**
 * Created by amit on 21/12/16.
 */

var globals = require("../globals"),
    eventEmitter = globals.eventEmitter,
    socket_manager = require("./socket_manager");

var gw_state_col = require("../model/gw_state_col"),
    gw_location_col = require("../model/gw_location_col"),
    gw_pps_info_col = require("../model/gw_pps_info_col");

var ft_log = require("../model/ft_log");

module.exports.gw_connected = function (app, socket, creds) {
    require("./nrf_dfu_gw")(app, socket, creds);

    //update the state of gateway in db
    var state_data = {};
    state_data.gw_state = 1;
    state_data.gw_uuid = creds.uuid;
    state_data.email = creds.email;
    gw_state_col.findOneAndUpdate({"gw_uuid": creds.uuid}, state_data, {upsert: true}, function (err, doc) {
        if (err) {
            console.log("Error: updating the online state of gateway");
            return;
        }
    });

    //update the location of gateway in db
    socket.on("gw_location", function (gw_loc) {
        gw_location_col.findOneAndUpdate({"gw_uuid": gw_loc.gw_uuid}, gw_loc, {upsert: true}, function (err) {
            if(err){
                console.log("Error: updating the location of gateway");
                return;
            }
        })
    });

    //update the peripherals connected to gateway info in db
    socket.on("pps_info", function (pps_info) {
        gw_pps_info_col.findOneAndUpdate({"gw_uuid": pps_info.gw_uuid}, pps_info, {upsert: true}, function (err) {
            if(err){
                console.log("Error: updating the location of gateway");
                return;
            }
        })
    })

    eventEmitter.emit('gw_online', {"creds": creds});

    socket_manager.add_socket_to_db(socket, creds);

    socket.on('ft_logdata', function (data) {
        var doc = new ft_log(data);
        doc.save(function (err) {
            if (err) {
                console.log("error : saving log to db : ", data);
            }
            eventEmitter.emit('beft_logdata', data);
        });
    });

    socket.on("upload_peripheral_data", function (peripheral_data) {
        peripherals.findOne(peripheral_data, function (err, peripheral) {
            if (err) {
                console.log("Eror: finding peripheral in db");
                return;
            } else if (peripheral) {
                var updateData = {online: 1};
                Usergws.findOneAndUpdate(peripheral_data, updateData, function (err, numbereffected, raw) {
                    if (err) {
                        console.log("error : changing state to online of peripheral");
                    }
                });
                console.log("success : peripheral already present in db");
                peripheral_online(peripheral, socket, creds);
            } else {
                peripheral_data.online = 1;
                var doc = new peripherals(peripheral_data);
                doc.save(function (err) {
                    if (err) {
                        console.log("error : saving peripheral to db");
                    } else {
                        console.log("success : peripheral saved to db");
                        peripheral_online(peripheral_data, socket, creds);
                    }
                });
            }
        })
    });

    var peripheral_online = function (peripheral, socket, creds) {
        // var peripheral_data = {"peripheral" : peripheral};
        eventEmitter.emit('peripheral_online', peripheral);
    }

    socket.on("peripheral_disconnected", function (peripheral_data) {
        eventEmitter.emit("peripheral_disconnected", peripheral_data);
    })
}