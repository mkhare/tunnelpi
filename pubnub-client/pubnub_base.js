var fs = require('fs');
var proj_config = require('./proj_config');
var gw_util = require('./gw_util');
var http = require('http');
var ngrok = require('ngrok');
var request = require('request');

var pubnub = require("pubnub")({
    publish_key: proj_config.set1.publish_key,
    subscribe_key: proj_config.set1.subscribe_key
});
var channel = proj_config.set1.channel_name;

var one_time_stuff_done = false;

var imgid = proj_config.set1.uuid + proj_config.set1.subscribe_key + proj_config.set1.publish_key + proj_config.set1.channel_name + proj_config.set1.email;
imgid = imgid.toString().split('').reverse().join('');
imgid = imgid.split('@').join('');
imgid = imgid.split('.').join('');

var url_to_send = "";

function delete_file(filename) {
    fs.stat(filename, function (err, stat) {
        if (err == null) {
            fs.unlinkSync(filename);
            console.log("Old log file deleted.");
        } else if (err.code == 'ENOENT') {
            // file does not exist
        } else {
            console.log("error while deleting file: " + filename);
        }
    });
}

module.exports.send_firmware_file_to_ble_devices = function (control_characteristic, data_characteristic, no_of_packets) {
    var control_code = proj_config.codes.delete_old_file;

    //String argument should be passed to buffer
    var control_data = new Buffer(control_code.toString());
    console.log('Data to be written to control characteristic : ', control_data.toString());
    control_characteristic.write(control_data, false, function (err) {
        if (err) {
            console.log(err);
        }
    })

    var channel_name = proj_config.set1.firmware_update_channel + "_" + proj_config.set1.uuid;
    // generic_pubnub_subscribe(channel_name, firmware_data_recvd);

    pubnub.subscribe({
        channel: channel_name,
        callback: firmware_data_recvd
    });

    var logfile_name = __dirname + "/public/firmwarelog.txt";
    delete_file(logfile_name);	//deleted old log file
    var first_write = true;
    function write_to_file(message) {
        var buf = new Buffer(message);
        if (first_write) {
            fs.writeFileSync(logfile_name, buf.toString());
            first_write = false;
        }
        else {
            fs.appendFileSync(logfile_name, buf.toString());
        }
        console.log("Data received from pubnub and written to log file.");
    }

    function firmware_data_recvd_test (data) {
        var buf = new Buffer(data);
        console.log("firmware data received : size : " + buf.length + " data : " + buf.toString());
    }

    var no_of_packets_received = 0;
    function firmware_data_recvd(data){
        var buf = new Buffer(data);
        console.log("firmware data received : size : " + buf.length + " data : " + buf.toString());
        data_characteristic.write(buf);
        no_of_packets_received += 1;
        console.log("sending data to ble device");
        if(no_of_packets_received == no_of_packets){
            console.log(no_of_packets + " packets sent to ble device");
        } else if(no_of_packets_received > no_of_packets) {
            console.log(no_of_packets_received + " packets (extra) sent to ble device : error");
        }
    }
}

module.exports.get_ready_for_firmware_update = function (filepath, gw_uuid) {
    var stats = fs.statSync(proj_config.set1.firmware_file_path);
    var fileSizeInBytes = stats["size"];
    var no_of_chunks = Math.ceil(fileSizeInBytes/ parseInt(proj_config.set1.file_transfer_packet_size, 10));
    console.log("no of packets to be sent : " + no_of_chunks.toString());
    var data_to_send = {
        code: proj_config.codes.new_firmware_available,
        reply : proj_config.codes.blank,
        uuid : gw_uuid,
        no_of_packets : no_of_chunks
    }

    if(!one_time_stuff_done) {
        pubnub.subscribe({
            channel: proj_config.set1.firmware_update_resp_channel,
            callback: data_recvd_cb
        });
        one_time_stuff_done = true;
        function data_recvd_cb(data) {
            console.log("response to get received : " + data.toString());
            if (data.uuid == gw_uuid && data.code == proj_config.codes.new_firmware_available && data.reply == proj_config.codes.success) {
                console.log("sending firmware");
                module.exports.send_firmware_file(filepath, gw_uuid);
            }
        }
    }
    generic_pubnub_publish(proj_config.set1.firmware_update_req_channel, data_to_send);
}

module.exports.resp_for_get_ready = function (data_characteristic, control_characteristic) {
    pubnub.subscribe({
        channel: proj_config.set1.firmware_update_req_channel,
        callback: data_recvd_cb
    });

    function data_recvd_cb (data) {
        if(data.uuid == proj_config.set1.uuid && data.code == proj_config.codes.new_firmware_available && data.reply == proj_config.codes.blank){
            console.log("no of packets to be sent to ble device : " + data.no_of_packets);
            module.exports.send_firmware_file_to_ble_devices(control_characteristic, data_characteristic, parseInt(data.no_of_packets));
            console.log("ready to receive firmware");
            data.reply = proj_config.codes.success;
            generic_pubnub_publish(proj_config.set1.firmware_update_resp_channel, data);
        }
    }
}

module.exports.send_firmware_file = function (filepath, gw_uuid) {
    fs.stat(filepath, function (err, stat) {
        if (err == null) {
            // fs.open(filepath, 'r', function (err, fd_firmwarefile) {
            //     if (err) {
            //         console.log("Error while opening the firmware file");
            //         return;
            //     }
            //     var buf = new Buffer(20);
            //     fs.read(fd_firmwarefile, buf, 0, buf.length, null, function (err, bytes_read) {
            //         if (err) {
            //             console.log("error while reading the firmware file");
            //             return;
            //         }
            //
            //         if (bytes_read > 0) {
            //             var channel_name = proj_config.set1.firmware_update_channel + "_" + gw_uuid;
            //             generic_pubnub_publish(channel_name, buf.slice(0, bytes_read));
            //         }
            //     })
            // })
            var chunk_size = parseInt(proj_config.set1.file_transfer_packet_size, 10);
            var no_of_chunks_sent = 0;
            var readstream = fs.createReadStream(filepath, {'bufferSize': chunk_size});
            readstream.on('readable', function () {
                var chunk;
                while (null != (chunk = readstream.read(chunk_size))) {
                    console.log("chunk size : " + chunk.length);
                    var channel_name = proj_config.set1.firmware_update_channel + "_" + gw_uuid;
                    generic_pubnub_publish(channel_name, chunk);
                    no_of_chunks_sent += 1;
                }
            })
            // readstream.on('data', function (chunk) {
            //     var channel_name = proj_config.set1.firmware_update_channel + "_" + gw_uuid;
            //     generic_pubnub_publish(channel_name, chunk);
            // });
            readstream.on('close', function () {
                console.log("file reading completed");

            })
        }
        else if (err.code == 'ENOENT') {
            console.log("firmware file doesn't exist");
            return;
        }
        else {
            console.log("error while checking the existance of firmare file");
        }
    })
}

var generic_pubnub_subscribe = function (channel_name, data_recvd_callback) {
    pubnub.subscribe({
        channel: channel_name,
        callback: data_recvd_callback
    });
}

var generic_pubnub_publish = function (channel_name, data_to_send) {
    pubnub.publish({
        channel: channel_name,
        message: data_to_send,
        callback: log,
        error: retry
    });

    function log(e) {
        console.log("Sending data over pubnub "+ data_to_send.toString());
    }

    function retry() {
        console.log('error occurred.');
    }
}

module.exports.send_server_url = function () {
    var urlreq_channel_name = proj_config.set1.email + "_urlreq";
    var urlresp_channel_name = proj_config.set1.email + "_urlresp";
    // console.log("channel name for url : " + url_channel_name)
    pubnub.subscribe({
        channel: urlreq_channel_name,
        callback: send_url_using_ngrok_clientAPI
    });

    function send_url_using_ngrok_clientAPI(message) {
        var port = proj_config.set1.serverport;
        if (url_to_send == "") {
            http.get({'host': 'localhost', 'port': 4040, 'path': '/api/tunnels'}, function (resp) {
                resp.on('data', function (tunnelsdata) {
                    tunnelsdata = JSON.parse(tunnelsdata);
                    tunnelsdata = tunnelsdata.tunnels;

                    for (var i in tunnelsdata) {
                        // console.log("tunnelsdata : " + JSON.stringify(tunnelsdata[i]));
                        if (tunnelsdata[i].config.addr == "localhost:" + port) {
                            url_to_send = tunnelsdata[i].public_url;
                            console.log("pu : " + url_to_send);
                            publish_url_data(url_to_send);
                            break;
                        }
                    }

                })
            });
        } else {
            publish_url_data(url_to_send);
        }
    }

    function send_url(message) {
        console.log('message received : ' + message);
        if (url_to_send == "") {
            ngrok.connect(proj_config.set1.serverport, function (err, url) {
                if (err) {
                    console.log("error while starting ngrok.");
                    return;
                }
                console.log("url : " + url);
                url_to_send = url;
                publish_url_data(url_to_send);
            })
        }
        else {
            publish_url_data(url_to_send);
        }
    }

    function publish_url_data(urlparam) {
        var urlid = imgid + 'url';
        var urldata = {gwurlid: urlid, gwurl: urlparam}
        console.log("url data : " + JSON.stringify(urldata));
        pubnub.publish({
            channel: urlresp_channel_name,
            message: urldata,
            callback: log,
            error: retry
        });
        function log(e) {
            console.log("Sending url over pubnub");
        }

        function retry() {
            console.log('error occurred.');
        }
    }

}

module.exports.publish_location_using_ip = function () {
    http.get({'host': 'freegeoip.net', 'port': 80, 'path': '/json/'}, function (resp) {
        resp.on('data', function (gloc) {
            gloc = JSON.parse(gloc);
            var loc = [gloc.latitude, gloc.longitude];
            console.log("Public IP address : " + gloc.ip);
            // console.log('loc : ' + gloc);
            module.exports.publish_location(loc);
        });
    });
}

module.exports.publish_location_using_ip_eurekapi = function () {
    var servicepath = '/iplocation/v1.8/locateip?key=' + proj_config.set1.eurekapi_key + '&ip=local-ip&format=json';
    // console.log('service path : ' + servicepath);
    http.get({'host': 'api.eurekapi.com', 'port': 80, 'path': servicepath}, function (resp) {
        resp.on('data', function (gloc) {
            // console.log('gloc : ' + gloc);
            gloc = JSON.parse(gloc);
            var loc = [gloc.geolocation_data.latitude, gloc.geolocation_data.longitude];
            console.log("Public IP address : " + gloc.ip_address);
            module.exports.publish_location(loc);
        });
    });
}

module.exports.publish_location = function (loc) {
    var gwuuid = JSON.stringify(proj_config.set1.uuid);
    var point = {
        latlng: loc,
        data: gwuuid
    };
    var pointname = "point_" + gwuuid;
    var msg = {};
    msg[pointname] = point;
    console.log("msg sent : " + JSON.stringify(msg));

    setInterval(function () {
        pubnub.publish({
            channel: proj_config.set1.email,
            message: msg
        });

    }, 2000);
};

module.exports.subscribe_data = function () {

    pubnub.subscribe({
        channel: channel,
        callback: output_method
    });

    var logfile_name = __dirname + "/public/btmonlog.txt"
    delete_file(logfile_name);	//deleted old log file

    function output_method(message) {
        if (process.argv && process.argv.length > 2) {
            if (process.argv[2] == 'nolog') {
                log(message);
            } else {
                console.log('incorrect command line argument');
                process.exit(1);
            }
        } else {
            write_to_file(message);
        }
    }

    var first_write = true;

    function write_to_file(message) {
        var buf = new Buffer(message);
        if (first_write) {
            fs.writeFileSync(logfile_name, buf.toString());
            first_write = false;
        }
        else {
            fs.appendFileSync(logfile_name, buf.toString());
        }
        console.log("Data received from pubnub and written to log file.");
    }

    function log(message) {
        var buf = new Buffer(message);
        console.log(buf.toString());
    }
}

module.exports.publish_data = function (data) {

    pubnub.publish({
        channel: channel,
        message: data,
        callback: log,
        error: retry
    });

    function log(e) {
        console.log("Sending data over pubnub");
    }

    function retry() {
        console.log('error occurred.');
    }
}