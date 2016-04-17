var request = require('request');
// var formData = require('form-data');
//
// var form = new formData();
//
// form.append('email', 'amit@gmail.com');
// form.append('password', 'abc');
// form.submit('http://localhost:8888/', function (err, res) {
//     if(err){
//         console.log('error in submitting form data');
//     }
//     else{
//         console.log(res);
//     }
// })

var cred = {
    email: 'amitchahar@gmail.com',
    password: 'asdf',
    subscribe_key: 'subkey2',
    publish_key : 'pubkey2',
    channel_name : 'demochannel2'
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