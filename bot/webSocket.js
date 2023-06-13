const {Server} = require("ws");
const EventEmitter = require("events");

const eventEmitter = new EventEmitter();
const wss = new Server({host: "192.168.3.61", port: 1987});

const state = {
    hostWs: null,
}

wss.on("connection", (ws) => {
    state.hostWs = ws;
    eventEmitter.emit("hostConnected");
});

module.exports = {
    state,
    hostEvents: eventEmitter
}