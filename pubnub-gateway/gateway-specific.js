module.exports = function(){
	var pubnub_base = require('./pubnub_base');
	var proj_config = require('./proj_config');
	require('./serverapp')();
	pubnub_base.subscribe_data();
	pubnub_base.send_server_url();
}