/**
 * Created by amit on 13/12/16.
 */

var pubnub_base = require("../pubnub_base"),
    pubnub = pubnub_base.pubnub,
    proj_config = require("../proj_config"),
    sudo = require("sudo"),
    child_process = require("child_process"),
    spawn = child_process.spawn,
    exec = child_process.exec,
    hashmap = require("hashmap");

var ad_data_map = new hashmap();
var ad_count_map = new hashmap();
//ubertooth data

function send_ut_data_to_server(ut_data) {
    pubnub.publish({
        channel: proj_config.netmon.ut_channel,
        message: ut_data,
        callback: log,
        error: retry
    });

    function log(e) {
        console.log("Sending ut data over pubnub");
    }

    function retry() {
        console.log('error occurred.');
    }
}

//this function deletes all the invalid characters from the json string
function json_data_refiner(s) {
    s = s.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
    // remove non-printable and other non-valid JSON chars
    s = s.replace(/[\u0000-\u0019]+/g, "");
    return s;
}

function capture_ut_data() {

    //first kill other ubertooth processes
    exec("killall ubertooth-btle", function (err, stdout, stderr) {
        if (err && err.code != 1) {
            console.log("exec error: " + err);
            return;
        }

        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);


        var ut = spawn("ubertooth-btle", ["-f"]);
        ut.stdout.on("data", function (data) {
            var ut_data_buffer = new Buffer(data);
            var ut_data_string = ut_data_buffer.toString();
            if (ut_data_string.includes("ubertooth-btle - passive Bluetooth Low Energy monitoring")) {
                console.log("Error: Ubertooth device not present on the system.");
            } else {
                var ut_json_data_string = ut_data_string.substring(ut_data_string.indexOf("^^^") + 3, ut_data_string.lastIndexOf("~~~"));
                //ut_json_data_string = json_data_refiner(ut_json_data_string);
                // var ut_json_data = JSON.parse(ut_json_data_string);
                // var adv_addr = ut_json_data.AdvA;
                // if(!ad_data_map.has(adv_addr)){
                //     ad_data_map.set(adv_addr, ut_json_data);
                //     send_ut_data_to_server(ut_json_data);
                //     ad_count_map.set(ut_json_data_string, 1);
                // } else if(ad_data_map.get(adv_addr) != ut_json_data){
                //     ad_data_map.set(adv_addr, ut_json_data);
                //     send_ut_data_to_server(ut_json_data);
                //     ad_count_map.set(ut_json_data_string, 1);
                // } else{
                //     ad_count_map.set(ut_json_data_string, ad_count_map.get(ut_json_data_string) + 1);
                // }

                var timestamp = Math.floor(Date.now() / 1000);
                var data_to_send = {
                    "ut_data_string": ut_json_data_string,
                    "timestamp": timestamp,
                    "email": proj_config.set1.email,
                    "gw_uuid" : proj_config.set1.uuid
                };
                send_ut_data_to_server(data_to_send);
                console.log(data_to_send);
            }
        })
    })

}

module.exports.capture_ut_data = capture_ut_data;