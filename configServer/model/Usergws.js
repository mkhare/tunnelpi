var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var schema = mongoose.Schema;

var usergwSchema = new schema({
    email : String,
    subscribeKey : String,
    publishKey : String,
    channelName : String
})

module.exports = mongoose.model('Usergws', usergwSchema);
