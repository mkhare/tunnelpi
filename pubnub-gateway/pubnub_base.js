var fs = require('fs');
var proj_config = require('./proj_config');
var gw_util = require('./gw_util');
var http = require('http');
var ngrok = require('ngrok');

var pubnub = require("pubnub")({
    publish_key: proj_config.set1.publish_key,
    subscribe_key: proj_config.set1.subscribe_key
});
var channel = proj_config.set1.channel_name;

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

module.exports.send_server_url = function () {
    var urlreq_channel_name = proj_config.set1.email + "_urlreq";
    var urlresp_channel_name = proj_config.set1.email + "_urlresp";
    // console.log("channel name for url : " + url_channel_name)
    pubnub.subscribe({
        channel: urlreq_channel_name,
        callback: send_url
    });

    function send_url(message) {
        console.log('message received : ' + message);
        if (url_to_send == "") {
            ngrok.connect(proj_config.set1.serverport, function (err, url) {
                if(err){
                    console.log("error while starting ngrok.");
                    return;
                }
                console.log("url : " + url);
                url_to_send = url;
                publish_url_data(url_to_send);
            })
        }
        else{
            publish_url_data(url_to_send);
        }
    }

    function publish_url_data(urlparam){
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