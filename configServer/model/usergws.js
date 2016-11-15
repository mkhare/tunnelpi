var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema;

var usergwSchema = schema({
    uuid : String,
    email : String,
    subscribe_key : String,
    publish_key : String,
    channel_name : String,
    devices : [],
    online : {type : Number, default : 0}
})

module.exports = mongoose.model('usergws', usergwSchema);
