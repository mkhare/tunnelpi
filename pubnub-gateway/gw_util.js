var events = require('events');
var eventEmitter = new events.EventEmitter();

module.exports.get_location = function () {
    var location = {
        latlng: [38.370375, -100.756138]
    };
    return location;
};