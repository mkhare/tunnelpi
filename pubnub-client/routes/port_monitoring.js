/**
 * Created by amit on 28/11/16.
 */

var pubnub_base = require("../pubnub_base"),
    pubnub = pubnub_base.pubnub,
    globals = require("../globals"),
    sockio = globals.sockio,
    proj_config = require("../proj_config"),
    netstat = require("node-netstat");


module.exports.find_open_ports = function () {

    var open_ports = [];

    netstat({
        done: send_open_ports_data_to_server
    }, function (portdata) {
        if (portdata.local.address == null && portdata.local.port != null && portdata.state == "LISTEN" && (open_ports.indexOf(portdata.local.port) > -1)) {
            console.log(portdata.local.port);
            open_ports.push(portdata.local.port);
        }
        // console.log(JSON.stringify(portdata, null, 4));
    })

    function send_open_ports_data_to_server(err) {
        if(err){
            console.log("error : sending open ports data to server");
        } else {
            console.log("sending open port data to server");
            sockio.emit("open_ports_data", {
                "uuid": proj_config.set1.uuid,
                "email": proj_config.set1.email,
                "open_ports": open_ports
            });
        }
    }
}
