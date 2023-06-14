const fastify = require("fastify")({ logger: true });
const { spawn, exec, execFile } = require("child_process");
const path = require("path");
const WebSocket = require("ws");

let serverProcess = null;
const ws = new WebSocket("ws://192.168.3.61:1987");

fastify.get("/start-server", async (request, reply) => {
  try {
    await new Promise((resolve, reject) => {
      serverProcess = spawn(
        "cmd.exe",
        ["/c", path.resolve("./enigmatica6/start-server.bat")],
        { stdio: "pipe" }
      );

      serverProcess.on("error", (error) => {
        reject(new Error(`Failed to start server: ${error.message}`));
        console.error(`Failed to start server: ${error.message}`);
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

        if (data.toString().includes("Press any key to continue"))
          serverProcess.kill();
      });

      serverProcess.on("exit", () => ws.send("server-off"));
    });

    reply.code(200).send("Server started");
  } catch (error) {
    reply.code(500).send(error.message);
  }
});

fastify.get("/stop-server", async (request, reply) => {
  serverProcess.stdin.write("/stop");
  serverProcess.stdin.end();

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
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};
start();
