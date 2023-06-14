const { SlashCommandBuilder } = require("discord.js");
const {
  isAliveHost,
  isAliveServer,
  powerOnHost,
  startServer,
} = require("../serverControls");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start-server")
    .setDescription("Starts the Enigmatica 6 server"),
  async execute(interaction) {
    if (await isAliveServer()) {
      interaction.reply("Server is already running");

      return;
    }

    if (isAliveHost()) {
      await interaction.reply("Starting server :hourglass:");
      await startServer();
      await interaction.editReply("Server running!");
      interaction.client.user.setActivity("Hosting Enigmatica 6");

      return;
    }

    await interaction.reply("Powering on host :hourglass:");
    await powerOnHost();
    await interaction.editReply("Host powered on!");

    await interaction.editReply("Starting server :hourglass:");
    await startServer();
    await interaction.editReply("Server running!");
    interaction.client.user.setActivity("Hostring Enigmatica 6");
  },
};
