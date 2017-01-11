/**
 * Created by amit on 20/12/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = Schema({
    email: String,
    gw_uuid : String,
    latitude: String,
    longitude: String,
})

module.exports = mongoose.model('gw_location_col', schema);