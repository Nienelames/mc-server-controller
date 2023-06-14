const WebSocket = require("ws");
const wol = require("wol");
const { state, hostEvents } = require("./webSocket");
const { Rcon } = require("rcon-client");

// VLAN credentials
const rcon = new Rcon({ host: "172.23.85.11", port: 25575, password: "e" });

module.exports = {
  isAliveHost: () => state.hostWs && state.hostWs.readyState === WebSocket.OPEN,
  powerOnHost: () =>
    new Promise((resolve, reject) => {
      wol.wake("D8-5E-D3-5F-10-B8", (error, response) => {
        if (error) reject(error);
        else hostEvents.on("hostConnected", () => resolve());
      });
    }),
  startServer: async () => await fetch("http://192.168.3.61:3000/start-server"),
  isAliveServer: async () =>
    new Promise(async (resolve, reject) => {
      try {
        await rcon.connect();
        await rcon.end();

        resolve(true);
      } catch (error) {
        if (error.code === "ECONNREFUSED") {
          resolve(false);

          return;
        }

        console.error(error);
        reject(error);
      }
    }),
  stopServer: async () => await fetch("http://192.168.3.61:3000/stop-server"),
};
