/**
 * Created by amit on 24/8/16.
 */

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var gw_pps_all = schema({
        email: String,
        gw_uuid: String,
        pp_id: String,
        pp_name: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('gw_pps_all', gw_pps_all);