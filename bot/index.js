const { REST, Routes } = require("discord.js");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const { token, clientId } = require("./config.json");
const { state, hostEvents } = require("./webSocket");
const fs = require("node:fs");
const path = require("node:path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, (client) => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  client.user.setActivity("Idling");
});

client.login(token);

client.commands = new Collection();
client.commands.set("start-server", require("./commands/startServer.js"));
const commands = [require("./commands/startServer.js").data.toJSON()];

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `There was an error while executing this command\n:${error}`,
      });
    } else {
      await interaction.reply({
        content: `There was an error while executing this command!\n${error}`,
      });
    }
  }
});

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

// const { Rcon } = require("rcon-client");
//
// const test = async () => {
//   const rcon = new Rcon({ host: "172.23.85.11", port: 25575, password: "e" });
//
//   await rcon.connect();
//   const response = await rcon.send("list");
//   console.log(response);
//   rcon.end();
// };
//
// test();
