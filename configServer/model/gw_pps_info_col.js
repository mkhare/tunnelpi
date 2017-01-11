/**
 * Created by amit on 21/12/16.
 */
/**
 * Created by amit on 20/12/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = Schema({
    email: String,
    gw_uuid : String,
    gw_pps: []
})

module.exports = mongoose.model('gw_pps_info_col', schema);