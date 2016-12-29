/**
 * Created by amit on 27/12/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = Schema({
    email: String,
    gw_uuid: String,
    pp_id: String,
    file_name : String,
    progress_pcnt: {type: String, default: "8"},
    progress_msg: {type: String, default: "Task added to queue"},
    times_failed: {type: Number, default: 0}
})

module.exports = mongoose.model('dfu_pending_tasks_col', schema);