var request = require('request');
var spawn = require('child_process').spawn;
var rl = require('readline');
var sudo = require('sudo');
var configserver = 'http://localhost:8888';
var sockio = require('socket.io-client')(configserver);
var events = require('events');
var eventEmitter = new events.EventEmitter();

var cred = {
    uuid: "1",
    email: 'amit@gmail.com',
    password: 'abc',
    subscribe_key: 'subkey2',
    publish_key: 'pubkey2',
    channel_name: 'ademochannel2',
    devices : [{devuuid : 'bluetoothDev1'}, {devuuid : 'bluetoothDev2'}]
};


var options = {
    cachePassword: true,
    prompt: 'Password, yo? ',
    spawnOptions: {shell: true, detached: true}
};

var pubnubclient = "";
if(process.argv && process.argv.length > 2){
    if(process.argv[2] == 'nobuild'){
        pubnubclient = sudo(['sh', '-c', './directrunscript']);
    }
    else{
        console.log('incorrect command line argument');
        process.exit(1);
    }
}
else{
    pubnubclient = sudo(['sh', '-c', './buildscript']);
}
// var pubnubclient = spawn('sh', ['-c', './pubnub_client'], {shell:true, detached: true});
pubnubclient.stdout.setEncoding('utf8');
// linereader = rl.createInterface(pubnubclient.stdout, pubnubclient.stdin);
// pubnubclient.unref();

var pninfofound = false;

//this variable is added to handle the case 'gateway become online before server become online'
var credready = false;
pubnubclient.stdout.on('data', function (data) {
// linereader.on('line', function (data) {
    console.log(data);

    if (pninfofound == false) {
        data = data.split('\n');
        //console.log(data);
        data.forEach(function (item) {
            var parts = item.split(' ');
            // console.log("parts : " + parts[0]);
            if (parts[0] == 'pubkey') {
                console.log('publish key found');
                cred.publish_key = parts[1];
                pninfofound = true;
            }
            else if (parts[0] == 'subkey') {
                console.log('subscribe key found');
                cred.subscribe_key = parts[1];
            } else if (parts[0] == 'chnlname') {
                console.log('channel name found');
                cred.channel_name = parts[1];
            }
        })
        if(pninfofound){
            credready = true;
            eventEmitter.emit('credformed');
    }

    }

});

pubnubclient.on('close', function (data) {
    console.log('bluetooth program stopped.');
});

// var firstTimeConnect = true;
sockio.on('connect', function (data) {
    console.log('socket connected to server');
    if(credready){
        console.log("socket connected already atleast once");
        sockio.emit('creds', cred);
    }
    eventEmitter.on('credformed', function (data) {
        request.post(configserver, {form: cred},function (error, response, body) {
            console.log("gateway is sending request");
            if (error)
                console.log(error);

            // if (response)
            //     console.log(response);

            if (!error && response.statusCode == 200) {
                console.log('succesfull login');
            }
        });

        // firstTimeConnect = false;
        sockio.emit('creds', cred);
        
    });
});

sockio.on('disconnect', function () {
    //sockio.disconnect();
    console.log('socket disconnected from server side');
});
