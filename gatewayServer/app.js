var request = require('request');

var configserver = 'http://localhost:8888';
var sockio = require('socket.io-client')(configserver);

var cred = {
    uuid : "1",
    email: 'amit@gmail.com',
    password: 'abc',
    subscribe_key: 'subkey2',
    publish_key : 'pubkey2',
    channel_name : 'ademochannel2'
};

request.post(
    'http://localhost:8888', { form : cred },
    function (error, response, body) {
        console.log("server is sending request");
        if(error)
            console.log(error);

        if(response)
            console.log(response);

        if (!error && response.statusCode == 200) {
            console.log('succesfull login');
        }
    }
);

sockio.on('connect', function (data) {
    console.log('socket connected to server');
    sockio.emit('creds', cred);
});


sockio.on('disconnect', function(){
    //sockio.disconnect();
    console.log('socket disconnected from server side');
});