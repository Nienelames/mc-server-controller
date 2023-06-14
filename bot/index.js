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
client.commands.set("stop-server", require("./commands/stopServer.js"));
const commands = [
  require("./commands/startServer.js").data.toJSON(),
  require("./commands/stopServer.js").data.toJSON(),
];

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
        content: `There was an error while executing this command\n:${error.message}`,
      });
    } else {
      await interaction.reply({
        content: `There was an error while executing this command!\n${error.message}`,
      });
    }
  }
});

hostEvents.on("hostConnected", () => {
  state.hostWs.on("message", (message) => {
    message.toString() === "server-off" && client.user.setActivity("Idling");
  });
  state.hostWs.on("close", () => client.user.setActivity("Idling"));
});
