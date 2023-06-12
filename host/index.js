const fastify = require('fastify')({logger: true});
const {spawn, exec, execFile} = require("child_process");
const path = require("path")

let serverProcess = null;

fastify.post('/start-server', async (request, reply) => {
    serverProcess = spawn('cmd.exe', ['/c', path.resolve('./enigmatica6/start-server.bat')], {stdio: "pipe"});

    serverProcess.on("error", (error) => {
        reply.code(500).send(`Failed to start server: ${error.message}`);
        console.error(`Failed to start server: ${error.message}`)
    });

    reply.code(200)
});

fastify.post('/stop-server', async (request, reply) => {
    serverProcess.stdin.write("/stop");
    serverProcess.stdin.end();
    serverProcess.stdout.on("data", (data) => {
        if (data.toString().includes("Press any key to continue"))
            serverProcess.kill();
    })

    // Hacky way to see if I'm using the PC
    await exec("tasklist | rg -m1 \"firefox.exe|Discord.exe\"", (error, stdout, stderr) => {
        if (stdout) reply.code(200)
        else exec(`powershell.exe -File ${path.resolve("./shutdown.ps1")}`)
    })
});

const start = async () => {
    try {
        await fastify.listen({port: 3000, host: "192.168.3.61"})
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()








