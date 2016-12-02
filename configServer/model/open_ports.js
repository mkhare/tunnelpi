/**
 * Created by amit on 28/11/16.
 */
var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var schema = Schema({
    "uuid": String,
    "email": String,
    "open_ports": []
});

module.exports = mongoose.model("open_ports", schema);