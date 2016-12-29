/**
 * Created by amit on 20/12/16.
 */

var http = require('http'),
    proj_config = require("../proj_config");

module.exports = function (sockio) {

    setInterval(publish_location_using_ip_ipinfoAPI, 30000);

    //getting and publishing location to server using ipinfo api
    function publish_location_using_ip_ipinfoAPI() {

        http.get('http://ipinfo.io', function (res) {
            res.on('data', function (data) {
                if (typeof data !== 'undefined' && data) {
                    // console.log('gloc : ' + data);
                    data = JSON.parse(data);
                    console.log("ip : " + data.ip);
                    var gloc = data["loc"].toString().split(",");
                    var latitude = parseFloat(gloc[0]);
                    var longitude = parseFloat(gloc[1]);
                    var loc_data = {};
                    loc_data.latitude = latitude;
                    loc_data.longitude = longitude;
                    var loc = [latitude, longitude];
                    publish_location(loc_data);
                } else {
                    console.log("unable to find geolocation");
                }
            });
        })
    }

    //publish location on socket to server
    publish_location = function (loc_data) {
        var gw_uuid = proj_config.set1.uuid,
            email = proj_config.set1.email;
        loc_data.gw_uuid = gw_uuid;
        loc_data.email = email;
        // console.log("msg sent : " + JSON.stringify(loc_data));
        sockio.emit("gw_location", loc_data);
    };


    //hardcoded location for testing purpose
    get_location = function () {
        var location = {
            latlng: [38.370375, -100.756138]
        };
        return location;
    };
}