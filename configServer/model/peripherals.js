/**
 * Created by amit on 24/8/16.
 */

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var peripherals = schema({
    email : String,
    gw_uuid : String,
    channel_name : String,
    peripheral_uuid : String,
    peripheral_addr : String,
    online : {type : Number, default : 0}
});

module.exports = mongoose.model('peripherals', peripherals);