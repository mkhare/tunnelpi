var proj_config = require('../proj_config');
var usergws = require('../model/usergws');
var server_util = require('../server_util');
var globals = require('../globals');
var eventEmitter = globals.eventEmitter;

var gw_location_col = require("../model/gw_location_col"),
    gw_pps_info_col = require("../model/gw_pps_info_col"),
    gw_state_col = require("../model/gw_state_col");

module.exports = function (app, io) {

    app.get('/profile', function (req, res) {
        res.writeHead(200, {"content-type": "text/plain"});
        res.write("on profile page");
        res.end();
    });

    app.get("/get_gw_details", function (req, res) {
        if (req.session.email) {
            var details = {};
            gw_location_col.find({"email": req.session.email}, "gw_uuid latitude longitude -_id", function (err, gw_loc_details) {
                if (err) {
                    console.log("Error: getting location details from db");
                    return;
                }
                details.gw_loc_details = gw_loc_details;

                gw_pps_info_col.find({"email": req.session.email}, "gw_uuid gw_pps -_id", function (err, gw_pps_info) {
                    if (err) {
                        console.log("Error: getting peripherals details from db");
                        return;
                    }
                    details.gw_pps_info = gw_pps_info;

                    gw_state_col.find({"email": req.session.email}, "gw_uuid gw_state -_id", function(err, gw_state_info){
                        if(err){
                            console.log("Error: getting gateway state details from db");
                            return;
                        }
                        details.gw_state_info = gw_state_info;
                        res.json(details);
                    })
                })
            })
         } else {
             res.render("index");
         }
    })
}