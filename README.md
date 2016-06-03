# tunnelpi
P2P security for the internet of things

configServer : configuration and management server

gatewayClient : simple gateway client for testing configServer. (Used only for testing purposes)

pubnub-client : captures bluetooth data packets and sends them over pubnub.

pubnub-gateway : receives bluetooth packets from pubnub.

BLE devices are currently hardcoded for the GUI. 

These projects are tested on Raspberry Pi 3 and used the mongo-server installed on ubuntu PC.

These projects are implemented using Jetbrains Webstorm IDE.

You can run the projects either by importing in Webstorm IDE or by running 'app.js' present in the project directory, using the command 'node app.js'.
Note : use sudo command to run the the pubnub-client and pubnub-gateway.

Requirements:

1. MongoDB should be running at its default port. You can change the port number or DB URL in config.js file in config directory of project.  
2. pubnub-client project contains the binary 'pubnub-client' which is used by the project. This binary should be compiled according to the platform.
3. Similarly, pubnub-gateway project also have 'pubnub-gateway' binary.