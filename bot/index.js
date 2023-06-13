const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");
const { state, hostEvents } = require("./webSocket");
const { Server } = require("ws");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (client) => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  client.user.setActivity("Idling");
});

client.login(token);

hostEvents.on("hostConnected", () => {
  state.hostWs.on("message", (message) => {
    switch (message.toString()) {
      case "server-off":
        client.user.setActivity("Idling");
        break;
      case "server-on":
        client.user.setActivity("Hosting Enigmatica 6");
        break;
    }
  });
  state.hostWs.on("close", () => {
    client.user.setPresence("Idling");
  });
});
