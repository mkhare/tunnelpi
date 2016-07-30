var gcm = require('node-gcm');
var proj_config = require('./proj_config');

var pubnub = require("pubnub")({
    publish_key: proj_config.publish_key,
    subscribe_key: proj_config.subscribe_key
});
console.log("here");
var pn_message = {
	info : "This message is for testing the WisperoGW app",
	"pn_gcm": {
		"data": {
			"title": "Pubnub-GCM message",
			"text": "Hi, How are you ?"
		}
	}
}

var channel_name = proj_config.channel_name;
pubnub.publish({
	channel: channel_name,
	message: pn_message,
	callback: log,
	error: retry
});

function log (e) {
	console.log("Sending data over pubnub");
}

function retry() {
	console.log('error occurred.');
}

//This code is for testing gcm only (without pubnub)
// var message = new gcm.Message();

// message.addData('hello', 'world');
// message.addNotification('title', 'Hello');
// message.addNotification('icon', 'ic_launcher');
// message.addNotification('body', 'World');


// //Add your mobile device registration tokens here
// var regTokens = ['eVq1IZLQyTE:APA91bFwN_c1B-1S1x3v16pgDVsd2_TEpiMUJh4H1avmEZOGxIDjiqnKH650T4Bs9xGK7iledFxAIqAVQNGPcf14_4V7FfnfN2oAHfHAnjkFJ8UFkiKuHRG3XhIzLk5zVQwRzPJ6m61o'];
// //Replace your developer API key with GCM enabled here
// var sender = new gcm.Sender('AIzaSyBDMejt390PmQJRogtsoulKOXYeDX7wSr8');

// sender.send(message, regTokens, function (err, response) {
// 	if(err) {
// 		console.error(err);
// 	} else {
// 		console.log(response);
// 	}
// });