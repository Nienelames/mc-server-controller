const { spawn, exec } = require("child_process");
const path = require("path");
const WebSocket = require("ws");

let serverProcess;
let childIds = [];
const ws = new WebSocket("ws://192.168.3.61:1987");

const initServerProcess = () => {
  serverProcess = spawn("cmd.exe", [
    "/c",
    "cd",
    path.resolve(__dirname, "enigmatica6"),
    "&&",
    "java",
    "-jar",
    "serverstarter-2.4.0.jar",
  ]);

  serverProcess.on("spawn", (subprocess) => {
    console.log("new process spawned", subprocess);
    const findChildProcesses = spawn("wmic", [
      "process",
      "where",
      `(ParentProcessId=${serverProcess.pid})`,
      "get",
      "ProcessId",
    ]);

    findChildProcesses.stdout.on("data", (data) => {
      const output = data.toString();
      const lines = output.split("\n").filter((line) => line.trim() !== "");

      // Remove the header line and empty last line
      lines.shift();
      lines.pop();

      const childPids = lines.map((line) => line.trim());
      console.log(`Child processes: ${childPids.join(", ")}`);
    });
  });
  // serverProcess.stdout.on("data", (data) => console.log(data.toString()));
  // serverProcess.stderr.on("data", (data) => console.log(data.toString()));
  serverProcess.on(
    "close",
    () => ws.readyState === WebSocket.OPEN && ws.send("server-off")
  );
  serverProcess.on("error", (error) => console.error(error));
};

const startServer = () =>
  new Promise((resolve, reject) => {
    if (!serverProcess || serverProcess.killed) initServerProcess();

    serverProcess.on("error", (error) => {
      reject(new Error(error.message));
    });

    serverProcess.stdout.on("data", (data) => {
      if (
        data
          .toString()
          .includes(
            "Loading of 'lightnetwork' for world minecraft:overworld finished"
          )
      )
        resolve();
    });
  });

const stopServer = () =>
  new Promise((resolve, reject) => {
    serverProcess.stdin.write("/stop\n");

    serverProcess.stdout.on("data", (data) => {
      if (data.toString().includes("Press any key to continue")) {
        ws.send("server-off");
        resolve();
      }
    });

    // Hacky way to see if I'm using the PC
    exec(
      'tasklist | rg -m1 "firefox.exe|Discord.exe"',
      (error, stdout, stderr) => {
        if (error) reject(error);

        if (!stdout.toString())
          exec(
            `powershell.exe -File ${path.resolve(__dirname, "shutdown.ps1")}`
          );
      }
    );
  });

const forceRestart = async () => {
  if (!serverProcess) throw new Error("Server not initialized");

  serverProcess.kill();

  await startServer();
};

module.exports = {
  startServer,
  stopServer,
  forceRestart,
};
