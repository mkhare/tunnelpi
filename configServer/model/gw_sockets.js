/**
 * Created by amit on 10/8/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = Schema({
    uuid : String,
    sock_id : String,
    creds : Schema.Types.Mixed
})

module.exports = mongoose.model('gw_sockets', schema);