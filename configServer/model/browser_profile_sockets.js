/**
 * Created by amit on 30/8/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = Schema({
    email : String,
    sock_id : String,
})

module.exports = mongoose.model('browser_home_sockets', schema);