const { spawn, exec } = require("child_process");
const path = require("path");
const WebSocket = require("ws");

const serverProcess = spawn(path.resolve("enigmatica6/start-server.bat"));
const ws = new WebSocket("ws://192.168.3.60:1987");

serverProcess.on(
  "close",
  () => ws.readyState === WebSocket.OPEN && ws.send("server-off")
);
serverProcess.on("error", (error) => console.error(error));

const startServer = () =>
  new Promise((resolve, reject) => {
    serverProcess.on("error", (error) => {
      reject(`Failed to start server: ${error.message}`);
    });

    serverProcess.stdout.on("data", (data) => {
      if (
        "Loading of 'lightnetwork' for world minecraft:overworld finished" in
        data.toString()
      )
        resolve();
    });
  });

const stopServer = () =>
  new Promise((resolve, reject) => {
    serverProcess.stdin.write("/stop");
    serverProcess.stdin.end();

    // Hacky way to see if I'm using the PC
    exec(
      'tasklist | rg -m1 "firefox.exe|Discord.exe"',
      (error, stdout, stderr) => {
        if (error) reject(error.message);

        if (!stdout.toString())
          exec(`powershell.exe -File ${path.resolve("./shutdown.ps1")}`);
      }
    );
  });

module.exports = {
  startServer,
  stopServer,
};
