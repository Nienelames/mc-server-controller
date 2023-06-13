const fastify = require("fastify")({ logger: true });
const { spawn, exec, execFile } = require("child_process");
const path = require("path");
const WebSocket = require("ws");

let serverProcess = null;
const ws = new WebSocket("ws://192.168.3.61:1987");

fastify.get("/start-server", async (request, reply) => {
  serverProcess = spawn(
    "cmd.exe",
    ["/c", path.resolve("./enigmatica6/start-server.bat")],
    { stdio: "pipe" }
  );

  serverProcess.on("error", (error) => {
    reply.code(500).send(`Failed to start server: ${error.message}`);
    console.error(`Failed to start server: ${error.message}`);
  });

  serverProcess.stdout.on(
    "data",
    (data) =>
      data
        .toString()
        .includes(
          "Loading of 'lightnetwork' for world minecraft:overworld finished"
        ) && ws.send("server-on")
  );

  serverProcess.on("exit", () => ws.send("server-off"));

  reply.code(200).send("Server starting");
});

fastify.get("/stop-server", async (request, reply) => {
  serverProcess.stdin.write("/stop");
  serverProcess.stdin.end();
  serverProcess.stdout.on(
    "data",
    (data) =>
      data.toString().includes("Press any key to continue") &&
      serverProcess.kill()
  );

  // Hacky way to see if I'm using the PC
  await exec(
    'tasklist | rg -m1 "firefox.exe|Discord.exe"',
    (error, stdout, stderr) =>
      stdout && exec(`powershell.exe -File ${path.resolve("./shutdown.ps1")}`)
  );

  reply.code(200).send("Server shut down successfully");
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "192.168.3.61" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();








