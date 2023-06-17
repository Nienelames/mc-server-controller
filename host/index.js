const fastify = require("fastify")({ logger: true });
const { exec } = require("child_process");
const { startServer, stopServer } = require("./server");

fastify.get("/start-server", async (request, reply) => {
  try {
    await startServer();

    reply.code(200).send("Server started successfully");
  } catch (error) {
    reply.code(500).send(error);
  }
});

fastify.get("/stop-server", async (request, reply) => {
  try {
    await stopServer();

    reply.code(200).send("Server shut down successfully");
  } catch (error) {
    reply.code(500).send(error);
  }
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
