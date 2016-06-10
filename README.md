# tunnelpi
P2P security for the internet of things

configServer : configuration and management server

gatewayClient : simple gateway client for testing configServer. (Used only for testing purposes)

pubnub-client : captures bluetooth data packets and sends them over pubnub.

pubnub-gateway : receives bluetooth packets from pubnub.

BLE devices are currently hardcoded for the GUI. 

pubnub-client requires btmon. 

http://stackoverflow.com/questions/23152592/bluetooth-sniffer-how-can-i-install-btmon-on-raspberry-pi

These projects are tested on Raspberry Pi 3 and used the mongo-server installed on ubuntu PC.

These projects are implemented using Jetbrains Webstorm IDE.

You can run the projects either by importing in Webstorm IDE or by running 'app.js' present in the project directory, using the command 'node app.js'.
Note : use sudo command to run the the pubnub-client and pubnub-gateway.

The address of configserver is given in a 'configserver' variable in app.js of pubnub_client and pubnub_gateway. The server address can be changed there.

The C program files folder (c-core-master) is present in project directory of pubnub_client and pubnub_gateway. A command line option can be passed to build the C project or use already built C project.

for example, in pubnub_client nodejs project directory,

    $ sudo node app.js
The above command will build or rebuild the executable files in /c-core-master/posix directory.

    $ sudo node app.js nobuild
The above command will use already build executable files in /c-core-master/posix directory. When running the nodejs project for first time, this option should not be used.

Requirements:

1. MongoDB should be running at its default port. You can change the port number or DB URL in config.js file in config directory of configserver project.  
