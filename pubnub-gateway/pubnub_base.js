var proj_config = require('./proj_config');

var pubnub = require("pubnub")({
	publish_key   : proj_config.set1.publish_key,
	subscribe_key : proj_config.set1.subscribe_key
});
var channel = proj_config.set1.channel_name;

module.exports.subscribe_data = function(){
	
	pubnub.subscribe({
		channel  : channel,
		callback : log
	});

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

	function log(e) { console.log(e) }
	function retry() { console.log('error occurred.') }
}