/**
 * Created by amit on 26/12/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = Schema({
    email: String,
    file_path : String
})

module.exports = mongoose.model('dfu_files_info_col', schema);