const eventEmitter = require('events').EventEmitter
var eventBus = new eventEmitter();
module.exports.event = eventBus;
