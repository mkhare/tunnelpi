/**
 * Created by amit on 20/12/16.
 */

var proj_config = require("../proj_config"),
    ipinfo = require("ipinfo");

module.exports = function (sockio) {

    //publishing location every 30 seconds
    publish_location_using_ipinfo();
    setInterval(publish_location_using_ipinfo, 30000);

    //method to publish geolocation to the server
    function publish_location_using_ipinfo(){
        ipinfo(function (err, data) {
            if(err){
                console.log("Error: getting location information: no internet connectivity");
                return;
            }
            // console.log("ip : " + data.ip);
            var gloc = data["loc"].toString().split(",");
            var latitude = parseFloat(gloc[0]);
            var longitude = parseFloat(gloc[1]);
            var loc_data = {};
            loc_data.latitude = latitude;
            loc_data.longitude = longitude;
            console.log("loc_data: ", loc_data);
            publish_location(loc_data);
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