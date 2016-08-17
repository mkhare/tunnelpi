/**
 * Created by amit on 12/8/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = Schema({
    logsource : String,
    email : String,
    sourcegw : String,
    destgw : String,
    logline : String,
})

module.exports = mongoose.model('ft_log', schema);