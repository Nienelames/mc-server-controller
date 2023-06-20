const WebSocket = require("ws");
const wol = require("wol");
const { state, hostEvents } = require("./webSocket");
const { Rcon } = require("rcon-client");
const { withTimeout } = require("./utils");

// VLAN credentials
const rcon = new Rcon({ host: "172.23.85.11", port: 25575, password: "e" });

module.exports = {
  isAliveHost: () => state.hostWs && state.hostWs.readyState === WebSocket.OPEN,
  powerOnHost: () =>
    withTimeout(
      new Promise((resolve, reject) => {
        wol.wake("D8-5E-D3-5F-10-B8", (error, response) => {
          if (error) reject(error);
          else hostEvents.on("hostConnected", () => resolve());
        });
      }),
      60
    ),
  startServer: () =>
    withTimeout(fetch("http://192.168.3.61:3000/start-server"), 120),
  isAliveServer: async () =>
    new Promise(async (resolve, reject) => {
      try {
        await rcon.connect();
        await rcon.end();

        resolve(true);
      } catch (error) {
        if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
          resolve(false);

          return;
        }

        console.error(error);
        reject(error);
      }
    }),
  stopServer: () =>
    withTimeout(fetch("http://192.168.3.61:3000/stop-server"), 20),
  runCommand: async (command) => {
    await rcon.connect();
    const response = await rcon.send(command);
    await rcon.end();

    return response;
  },
  forceRestart: () =>
    withTimeout(fetch("http://192.168.3.61:3000/force-restart"), 130),
};
