var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema;

var usergwSchema = new schema({
    uuid : String,
    email : String,
    subscribeKey : String,
    publishKey : String,
    channelName : String,
    location : {},
    devices : [],
    online : {type : Number, default : 0}
})

module.exports = mongoose.model('Usergws', usergwSchema);
