var fs = require('fs');
var proj_config = require('./proj_config');

var pubnub = require("pubnub")({
	publish_key   : proj_config.set1.publish_key,
	subscribe_key : proj_config.set1.subscribe_key
});
var channel = proj_config.set1.channel_name;

function delete_file(filename){
	fs.statSync(filename, function(err, stat) {
    if(err == null) {
        fs.unlinkSync(filename);
		console.log("Old log file deleted.");
    } 
    else {
        console.log("error while deleting file: " + filename);
    }
});
}

module.exports.subscribe_data = function(){
	
	pubnub.subscribe({
		channel  : channel,
		callback : write_to_file
	});

	var first_write = true;
	var logfile_name = __dirname + "/public/btmonlog.txt"
	function write_to_file(message){
		var buf = new Buffer(message);
		if(first_write){
			fs.writeFileSync(logfile_name, buf.toString());
			first_write = false;
		}
		else{
			fs.appendFileSync(logfile_name, buf.toString());
		}
		console.log("Data received from pubnub and written to log file.");
	}

	function log(message) {
  		var buf = new Buffer(message);
		console.log(buf.toString());
	}
}

module.exports.publish_data = function(data){

	pubnub.publish({
		channel  : channel,
		message  : data,
		callback : log,
		error    : retry
	});

	function log(e) { console.log("Sending data over pubnub"); }
	function retry() { console.log('error occurred.'); }
}