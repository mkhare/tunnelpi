/**
 * Created by amit on 21/12/16.
 */
var proj_config = require("../proj_config");

module.exports = function(sockio){

    setInterval(send_pps_details, 30000);

     function send_pps_details () {
        var pps = [];
        pps.push({"pp_name": "Heart Rate Monitor"});
        pps.push({"pp_name": "ECG Machine"});
        pps.push({"pp_name": "BP Monitor"});

        var pps_details = {};
        pps_details.gw_uuid = proj_config.set1.uuid;
        pps_details.email = proj_config.set1.email;
        pps_details.gw_pps = pps;

        // console.log(JSON.stringify(pps_details));
        sockio.emit("pps_info", pps_details);
    }
}
