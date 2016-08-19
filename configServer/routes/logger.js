/**
 * Created by amit on 19/8/16.
 */
var ft_log = require('../model/ft_log');
var globals = require('../globals');
var eventEmitter = globals.eventEmitter;

module.exports.ft_logger = function (email, sgw, dgw, ll) {
    var ls = "config_server";
    var log_data = {"logsource": ls, "email": email, "sourcegw": sgw, "destgw": dgw, "logline": ll};
    console.log(JSON.stringify(log_data));
    var doc = new ft_log(log_data);
    doc.save(function (err) {
        if (err) {
            console.log("error : saving log to db : ", log_data);
        }
        eventEmitter.emit('beft_logdata', log_data);
    })
}